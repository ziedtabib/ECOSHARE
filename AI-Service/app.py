from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import random
import re
import base64
from PIL import Image
import io
from datetime import datetime, timedelta
import logging
import requests
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import cv2
import os
from config import config

# Créer l'application Flask
app = Flask(__name__)

# Configuration
config_name = os.environ.get('FLASK_ENV', 'development')
app.config.from_object(config[config_name])

# Configuration CORS
CORS(app, origins=[app.config['FRONTEND_URL']])

# Configuration du logging
logging.basicConfig(
    level=getattr(logging, app.config['LOG_LEVEL']),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Catégories d'objets ECOSHARE
OBJECT_CATEGORIES = {
    'electronics': ['laptop', 'computer', 'keyboard', 'mouse', 'monitor', 'phone', 'tablet', 'camera'],
    'clothing': ['shirt', 'dress', 'jacket', 'pants', 'shoes', 'hat', 'gloves', 'scarf'],
    'furniture': ['chair', 'table', 'sofa', 'bed', 'desk', 'cabinet', 'shelf', 'lamp'],
    'books': ['book', 'magazine', 'notebook', 'dictionary', 'novel', 'textbook'],
    'toys': ['toy', 'doll', 'ball', 'puzzle', 'game', 'teddy bear', 'action figure'],
    'sports': ['ball', 'racket', 'bike', 'helmet', 'sneakers', 'gym equipment'],
    'beauty': ['cosmetics', 'perfume', 'makeup', 'skincare', 'hair care'],
    'home': ['kitchen', 'bathroom', 'decor', 'utensils', 'appliances']
}

# Catégories d'aliments
FOOD_CATEGORIES = {
    'fruits': ['apple', 'banana', 'orange', 'grape', 'strawberry', 'lemon', 'pear', 'peach'],
    'vegetables': ['carrot', 'broccoli', 'tomato', 'potato', 'onion', 'lettuce', 'cucumber', 'pepper'],
    'dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'ice cream'],
    'meat': ['chicken', 'beef', 'pork', 'fish', 'sausage', 'bacon'],
    'bakery': ['bread', 'cake', 'cookie', 'croissant', 'bagel', 'muffin'],
    'canned': ['soup', 'beans', 'tuna', 'corn', 'peas'],
    'beverages': ['water', 'juice', 'soda', 'coffee', 'tea', 'wine', 'beer'],
    'snacks': ['chips', 'nuts', 'crackers', 'candy', 'chocolate']
}

def enhanced_classify_object(image_data):
    """Classification d'objet améliorée avec analyse d'image"""
    try:
        # Charger et analyser l'image
        image = load_image_from_data(image_data)
        if image is None:
            return fallback_classification(image_data)
        
        # Analyse de base de l'image
        image_analysis = analyze_image_properties(image)
        
        # Classification basée sur les caractéristiques visuelles
        visual_features = extract_visual_features(image)
        
        # Classification par similarité avec des descriptions
        text_classification = classify_by_text_similarity(image_data)
        
        # Combiner les résultats
        final_classification = combine_classifications(
            image_analysis, 
            visual_features, 
            text_classification
        )
        
        # Améliorer la détection de l'état
        condition = detect_object_condition(image, final_classification['category'])
        
        # Estimation de valeur plus précise
        estimated_value = estimate_object_value_enhanced(
            final_classification['category'], 
            condition, 
            image_analysis
        )
        
        return {
            'category': final_classification['category'],
            'subcategory': final_classification['subcategory'],
            'condition': condition,
            'confidence': final_classification['confidence'],
            'tags': final_classification['tags'],
            'estimated_value': estimated_value,
            'is_recyclable': check_recyclability(final_classification['category']),
            'recycling_instructions': get_recycling_instructions(final_classification['category']),
            'image_analysis': image_analysis,
            'quality_score': calculate_quality_score(image, condition)
        }
        
    except Exception as e:
        logger.error(f"Erreur lors de la classification d'objet: {e}")
        return fallback_classification(image_data)

def load_image_from_data(image_data):
    """Charger une image à partir de différentes sources"""
    try:
        if isinstance(image_data, str):
            if image_data.startswith('data:image'):
                # Image en base64
                header, encoded = image_data.split(',', 1)
                image_bytes = base64.b64decode(encoded)
                return Image.open(io.BytesIO(image_bytes))
            elif image_data.startswith('http'):
                # URL d'image
                response = requests.get(image_data, timeout=10)
                return Image.open(io.BytesIO(response.content))
            else:
                # Chemin de fichier
                return Image.open(image_data)
        return None
    except Exception as e:
        logger.error(f"Erreur lors du chargement de l'image: {e}")
        return None

def analyze_image_properties(image):
    """Analyser les propriétés de base de l'image"""
    try:
        # Convertir en RGB si nécessaire
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Convertir en numpy array
        img_array = np.array(image)
        
        # Propriétés de base
        height, width = img_array.shape[:2]
        
        # Analyse des couleurs dominantes
        dominant_colors = get_dominant_colors(img_array)
        
        # Analyse de la luminosité
        brightness = np.mean(img_array)
        
        # Analyse du contraste
        contrast = np.std(img_array)
        
        # Détection de bords (pour évaluer la netteté)
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        sharpness = np.sum(edges) / (height * width)
        
        return {
            'dimensions': {'width': width, 'height': height},
            'dominant_colors': dominant_colors,
            'brightness': float(brightness),
            'contrast': float(contrast),
            'sharpness': float(sharpness),
            'aspect_ratio': width / height
        }
    except Exception as e:
        logger.error(f"Erreur lors de l'analyse de l'image: {e}")
        return {}

def get_dominant_colors(img_array, k=5):
    """Obtenir les couleurs dominantes de l'image"""
    try:
        # Redimensionner l'image pour accélérer le traitement
        small_img = cv2.resize(img_array, (150, 150))
        data = small_img.reshape((-1, 3))
        data = np.float32(data)
        
        # K-means clustering pour trouver les couleurs dominantes
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
        _, labels, centers = cv2.kmeans(data, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
        
        # Compter les occurrences
        unique, counts = np.unique(labels, return_counts=True)
        
        # Trier par fréquence
        color_counts = list(zip(centers[unique], counts))
        color_counts.sort(key=lambda x: x[1], reverse=True)
        
        return [{'rgb': color.tolist(), 'frequency': int(count)} for color, count in color_counts]
    except Exception as e:
        logger.error(f"Erreur lors de l'extraction des couleurs: {e}")
        return []

def analyze_dominant_colors(dominant_colors):
    """Analyser les couleurs dominantes pour la classification"""
    try:
        if not dominant_colors:
            return {}
        
        analysis = {
            'has_metallic_colors': False,
            'has_neutral_colors': False,
            'has_vibrant_colors': False,
            'has_wood_colors': False,
            'has_bright_colors': False,
            'has_sport_colors': False,
            'has_beauty_colors': False,
            'has_home_colors': False
        }
        
        for color_data in dominant_colors:
            rgb = color_data.get('rgb', [0, 0, 0])
            r, g, b = rgb
            
            # Couleurs métalliques (gris, argent, or)
            if 100 <= r <= 200 and 100 <= g <= 200 and 100 <= b <= 200:
                analysis['has_metallic_colors'] = True
            
            # Couleurs neutres (beiges, bruns, gris)
            if (80 <= r <= 180 and 80 <= g <= 180 and 80 <= b <= 180) or \
               (r > g + 20 and r > b + 20):  # Tons bruns
                analysis['has_neutral_colors'] = True
            
            # Couleurs vives (saturation élevée)
            max_val = max(r, g, b)
            min_val = min(r, g, b)
            if max_val > 150 and (max_val - min_val) > 50:
                analysis['has_vibrant_colors'] = True
            
            # Couleurs bois (bruns, beiges)
            if r > g + 10 and r > b + 10 and r > 100:
                analysis['has_wood_colors'] = True
            
            # Couleurs vives et saturées
            if max(r, g, b) > 180 and min(r, g, b) < 100:
                analysis['has_bright_colors'] = True
            
            # Couleurs sport (rouge, bleu, vert vifs)
            if (r > 150 and g < 100 and b < 100) or \
               (b > 150 and r < 100 and g < 100) or \
               (g > 150 and r < 100 and b < 100):
                analysis['has_sport_colors'] = True
            
            # Couleurs beauté (pastels, roses, violets)
            if (r > 150 and g > 100 and b > 150) or \
               (r > 150 and g < 100 and b > 150):
                analysis['has_beauty_colors'] = True
            
            # Couleurs maison (neutres, terre)
            if 50 <= r <= 150 and 50 <= g <= 150 and 50 <= b <= 150:
                analysis['has_home_colors'] = True
        
        return analysis
    except Exception as e:
        logger.error(f"Erreur lors de l'analyse des couleurs: {e}")
        return {}

def extract_visual_features(image):
    """Extraire des caractéristiques visuelles pour la classification"""
    try:
        img_array = np.array(image.convert('RGB'))
        
        # Détection de formes basiques
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        
        # Détection de contours
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Caractéristiques géométriques
        if contours:
            largest_contour = max(contours, key=cv2.contourArea)
            area = cv2.contourArea(largest_contour)
            perimeter = cv2.arcLength(largest_contour, True)
            
            # Forme approximative
            epsilon = 0.02 * perimeter
            approx = cv2.approxPolyDP(largest_contour, epsilon, True)
            vertices = len(approx)
            
            # Ratio de forme
            if perimeter > 0:
                circularity = 4 * np.pi * area / (perimeter * perimeter)
            else:
                circularity = 0
        else:
            area = 0
            vertices = 0
            circularity = 0
        
        return {
            'shape_features': {
                'area': float(area),
                'vertices': int(vertices),
                'circularity': float(circularity),
                'contour_count': len(contours)
            }
        }
    except Exception as e:
        logger.error(f"Erreur lors de l'extraction des caractéristiques: {e}")
        return {}

def classify_by_text_similarity(image_data):
    """Classification basée sur la similarité textuelle"""
    try:
        # Extraire du texte de l'image (simulation)
        image_text = extract_text_from_image(image_data)
        
        # Descriptions d'objets pour la comparaison (plus détaillées)
        object_descriptions = {
            'electronics': 'appareil électronique téléphone ordinateur tablette écran clavier souris laptop computer phone tablet screen keyboard mouse camera electronic device tech gadget',
            'clothing': 'vêtement chemise pantalon robe chaussures chapeau gants écharpe shirt pants dress shoes hat gloves scarf jacket coat clothing fashion wear',
            'furniture': 'meuble chaise table canapé lit bureau armoire étagère lampe chair table sofa bed desk cabinet shelf lamp furniture wood furniture home decor',
            'books': 'livre magazine cahier dictionnaire roman manuel scolaire book magazine notebook dictionary novel textbook reading paper pages text',
            'toys': 'jouet poupée ballon puzzle jeu ours en peluche figurine toy doll ball puzzle game teddy bear action figure children kids play',
            'sports': 'sport ballon raquette vélo casque chaussures équipement gym sport ball racket bike helmet sneakers gym equipment fitness exercise',
            'beauty': 'cosmétique parfum maquillage soin cheveux beauté cosmetic perfume makeup skincare hair care beauty product beauty care',
            'home': 'maison cuisine salle de bain décoration ustensile électroménager house kitchen bathroom decoration utensil appliance home decor'
        }
        
        # Calculer la similarité
        vectorizer = TfidfVectorizer()
        
        # Créer un corpus avec le texte de l'image et les descriptions
        corpus = [image_text] + list(object_descriptions.values())
        tfidf_matrix = vectorizer.fit_transform(corpus)
        
        # Calculer la similarité avec chaque catégorie
        similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])
        
        # Trouver la catégorie la plus similaire
        best_match_idx = np.argmax(similarities[0])
        categories = list(object_descriptions.keys())
        best_category = categories[best_match_idx]
        confidence = float(similarities[0][best_match_idx])
        
        # Si la confiance est trop faible, essayer une approche plus simple
        if confidence < 0.3:
            # Recherche de mots-clés simples
            image_text_lower = image_text.lower()
            keyword_scores = {}
            
            for category, keywords in OBJECT_CATEGORIES.items():
                score = 0
                for keyword in keywords:
                    if keyword in image_text_lower:
                        score += 1
                keyword_scores[category] = score
            
            if keyword_scores and max(keyword_scores.values()) > 0:
                best_category = max(keyword_scores, key=keyword_scores.get)
                confidence = 0.6
        
        return {
            'category': best_category,
            'confidence': confidence,
            'text_analysis': image_text
        }
    except Exception as e:
        logger.error(f"Erreur lors de la classification textuelle: {e}")
        return {'category': 'other', 'confidence': 0.5}

def extract_text_from_image(image_data):
    """Extraire du texte de l'image (simulation)"""
    # Dans une vraie implémentation, on utiliserait OCR (Tesseract, etc.)
    # Pour l'instant, on simule basé sur l'URL ou le nom de fichier
    image_str = str(image_data).lower()
    
    # Mots-clés communs
    keywords = []
    for category, words in OBJECT_CATEGORIES.items():
        for word in words:
            if word in image_str:
                keywords.append(word)
    
    # Ajouter des mots-clés génériques basés sur des patterns communs
    generic_keywords = []
    
    # Patterns d'URLs d'images
    if 'phone' in image_str or 'mobile' in image_str:
        generic_keywords.extend(['phone', 'mobile', 'smartphone'])
    if 'laptop' in image_str or 'computer' in image_str:
        generic_keywords.extend(['laptop', 'computer', 'notebook'])
    if 'book' in image_str or 'magazine' in image_str:
        generic_keywords.extend(['book', 'magazine', 'reading'])
    if 'chair' in image_str or 'table' in image_str:
        generic_keywords.extend(['chair', 'table', 'furniture'])
    if 'shirt' in image_str or 'dress' in image_str:
        generic_keywords.extend(['shirt', 'dress', 'clothing'])
    if 'toy' in image_str or 'doll' in image_str:
        generic_keywords.extend(['toy', 'doll', 'play'])
    if 'ball' in image_str or 'sport' in image_str:
        generic_keywords.extend(['ball', 'sport', 'exercise'])
    if 'cosmetic' in image_str or 'beauty' in image_str:
        generic_keywords.extend(['cosmetic', 'beauty', 'makeup'])
    if 'kitchen' in image_str or 'home' in image_str:
        generic_keywords.extend(['kitchen', 'home', 'house'])
    
    # Combiner tous les mots-clés
    all_keywords = keywords + generic_keywords
    
    return ' '.join(all_keywords) if all_keywords else 'objet inconnu'

def combine_classifications(image_analysis, visual_features, text_classification):
    """Combiner les différentes classifications"""
    try:
        # Poids pour chaque méthode
        weights = {
            'visual': 0.4,
            'text': 0.4,
            'image_properties': 0.2
        }
        
        # Classification basée sur les propriétés de l'image
        property_classification = classify_by_image_properties(image_analysis)
        
        # Combiner les résultats
        all_categories = set()
        all_categories.add(text_classification['category'])
        all_categories.add(property_classification['category'])
        
        # Calculer les scores pondérés
        category_scores = {}
        for category in all_categories:
            score = 0
            if category == text_classification['category']:
                score += text_classification['confidence'] * weights['text']
            if category == property_classification['category']:
                score += property_classification['confidence'] * weights['image_properties']
            
            category_scores[category] = score
        
        # Trouver la meilleure catégorie
        best_category = max(category_scores, key=category_scores.get)
        confidence = category_scores[best_category]
        
        return {
            'category': best_category,
            'subcategory': random.choice(OBJECT_CATEGORIES.get(best_category, ['objet'])),
            'confidence': confidence,
            'tags': random.sample(OBJECT_CATEGORIES.get(best_category, ['objet']), 
                                min(3, len(OBJECT_CATEGORIES.get(best_category, ['objet']))))
        }
    except Exception as e:
        logger.error(f"Erreur lors de la combinaison des classifications: {e}")
        return {'category': 'other', 'subcategory': 'objet', 'confidence': 0.5, 'tags': ['objet']}

def classify_by_image_properties(image_analysis):
    """Classification basée sur les propriétés de l'image"""
    try:
        if not image_analysis:
            return {'category': 'other', 'confidence': 0.5}
        
        # Règles basées sur les propriétés
        brightness = image_analysis.get('brightness', 128)
        contrast = image_analysis.get('contrast', 50)
        aspect_ratio = image_analysis.get('aspect_ratio', 1.0)
        sharpness = image_analysis.get('sharpness', 0)
        dominant_colors = image_analysis.get('dominant_colors', [])
        
        # Analyser les couleurs dominantes
        color_analysis = analyze_dominant_colors(dominant_colors)
        
        # Classification améliorée basée sur plusieurs critères
        category_scores = {}
        
        # Électronique - objets sombres, couleurs métalliques
        if brightness < 100 or color_analysis.get('has_metallic_colors', False):
            category_scores['electronics'] = 0.7
        
        # Livres - forme rectangulaire, couleurs neutres
        if 0.6 <= aspect_ratio <= 1.4 and color_analysis.get('has_neutral_colors', False):
            category_scores['books'] = 0.8
        
        # Vêtements - fort contraste, couleurs vives
        if contrast > 60 and color_analysis.get('has_vibrant_colors', False):
            category_scores['clothing'] = 0.7
        
        # Meubles - forme carrée/rectangulaire, couleurs bois
        if 0.7 <= aspect_ratio <= 1.3 and color_analysis.get('has_wood_colors', False):
            category_scores['furniture'] = 0.8
        
        # Jouets - couleurs vives, formes variées
        if color_analysis.get('has_bright_colors', False) and sharpness > 0.05:
            category_scores['toys'] = 0.6
        
        # Sports - couleurs vives, contraste élevé
        if contrast > 80 and color_analysis.get('has_sport_colors', False):
            category_scores['sports'] = 0.7
        
        # Beauté - couleurs pastel ou vives, forme compacte
        if color_analysis.get('has_beauty_colors', False) and aspect_ratio < 2:
            category_scores['beauty'] = 0.6
        
        # Maison - couleurs neutres, forme variée
        if color_analysis.get('has_home_colors', False):
            category_scores['home'] = 0.6
        
        # Si aucune catégorie n'a un score suffisant, utiliser des règles de fallback
        if not category_scores or max(category_scores.values()) < 0.5:
            # Règles de fallback plus généreuses
            if brightness < 120:
                category_scores['electronics'] = 0.5
            elif aspect_ratio > 1.5 or aspect_ratio < 0.7:
                category_scores['books'] = 0.5
            elif contrast > 40:
                category_scores['clothing'] = 0.5
            else:
                category_scores['home'] = 0.5
        
        # Retourner la catégorie avec le meilleur score
        best_category = max(category_scores, key=category_scores.get)
        confidence = category_scores[best_category]
        
        return {'category': best_category, 'confidence': confidence}
    except Exception as e:
        logger.error(f"Erreur lors de la classification par propriétés: {e}")
        return {'category': 'other', 'confidence': 0.5}

def detect_object_condition(image, category):
    """Détecter l'état de l'objet à partir de l'image"""
    try:
        img_array = np.array(image.convert('RGB'))
        
        # Analyser la netteté
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # Analyser les couleurs (détection de rouille, décoloration, etc.)
        hsv = cv2.cvtColor(img_array, cv2.COLOR_RGB2HSV)
        
        # Détecter les couleurs de détérioration
        brown_lower = np.array([10, 50, 20])
        brown_upper = np.array([20, 255, 200])
        brown_mask = cv2.inRange(hsv, brown_lower, brown_upper)
        brown_percentage = np.sum(brown_mask > 0) / (img_array.shape[0] * img_array.shape[1])
        
        # Détecter les rayures ou dommages
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / (img_array.shape[0] * img_array.shape[1])
        
        # Déterminer l'état
        if laplacian_var > 1000 and brown_percentage < 0.1 and edge_density < 0.1:
            return 'excellent'
        elif laplacian_var > 500 and brown_percentage < 0.2 and edge_density < 0.2:
            return 'good'
        elif laplacian_var > 200 and brown_percentage < 0.4 and edge_density < 0.4:
            return 'fair'
        else:
            return 'poor'
    except Exception as e:
        logger.error(f"Erreur lors de la détection de l'état: {e}")
        return 'good'

def estimate_object_value_enhanced(category, condition, image_analysis):
    """Estimation de valeur améliorée"""
    try:
        base_values = {
            'electronics': 150,
            'furniture': 80,
            'clothing': 30,
            'books': 15,
            'toys': 25,
            'sports': 50,
            'beauty': 40,
            'home': 35,
            'other': 20
        }
        
        condition_multipliers = {
            'excellent': 1.0,
            'good': 0.7,
            'fair': 0.4,
            'poor': 0.1
        }
        
        base_value = base_values.get(category, 20)
        condition_multiplier = condition_multipliers.get(condition, 0.4)
        
        # Ajustement basé sur la qualité de l'image
        quality_bonus = 0
        if image_analysis:
            sharpness = image_analysis.get('sharpness', 0)
            if sharpness > 0.1:  # Image nette
                quality_bonus = 0.1
        
        final_value = base_value * condition_multiplier * (1 + quality_bonus)
        return int(final_value)
    except Exception as e:
        logger.error(f"Erreur lors de l'estimation de valeur: {e}")
        return 20

def calculate_quality_score(image, condition):
    """Calculer un score de qualité global"""
    try:
        img_array = np.array(image.convert('RGB'))
        
        # Score basé sur la netteté
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()
        sharpness_score = min(sharpness / 1000, 1.0)
        
        # Score basé sur l'état
        condition_scores = {
            'excellent': 1.0,
            'good': 0.8,
            'fair': 0.6,
            'poor': 0.3
        }
        condition_score = condition_scores.get(condition, 0.5)
        
        # Score basé sur la luminosité et le contraste
        brightness = np.mean(img_array)
        contrast = np.std(img_array)
        lighting_score = 1.0 - abs(brightness - 128) / 128
        contrast_score = min(contrast / 100, 1.0)
        
        # Score global
        overall_score = (
            sharpness_score * 0.3 +
            condition_score * 0.4 +
            lighting_score * 0.15 +
            contrast_score * 0.15
        )
        
        return float(overall_score)
    except Exception as e:
        logger.error(f"Erreur lors du calcul du score de qualité: {e}")
        return 0.5

def fallback_classification(image_data):
    """Classification de secours si l'analyse d'image échoue"""
    image_str = str(image_data).lower()
    best_category = 'other'
    confidence = 0.5
    
    for category, keywords in OBJECT_CATEGORIES.items():
        if any(keyword in image_str for keyword in keywords):
            best_category = category
            confidence = 0.7
            break
    
    return {
        'category': best_category,
        'subcategory': random.choice(OBJECT_CATEGORIES.get(best_category, ['objet'])),
        'condition': 'good',
        'confidence': confidence,
        'tags': random.sample(OBJECT_CATEGORIES.get(best_category, ['objet']), 
                            min(3, len(OBJECT_CATEGORIES.get(best_category, ['objet'])))),
        'estimated_value': estimate_object_value(best_category, 'good'),
        'is_recyclable': check_recyclability(best_category),
        'recycling_instructions': get_recycling_instructions(best_category),
        'image_analysis': {},
        'quality_score': 0.5
    }

def mock_classify_food(image_data):
    """Mock classification d'aliment - version simplifiée sans TensorFlow"""
    try:
        # Simulation d'une classification basée sur des mots-clés
        image_str = str(image_data).lower()
        
        # Déterminer le type d'aliment
        best_food_type = 'other'
        confidence = random.uniform(0.6, 0.9)
        
        for food_type, keywords in FOOD_CATEGORIES.items():
            if any(keyword in image_str for keyword in keywords):
                best_food_type = food_type
                break
        
        # Déterminer la condition
        condition = 'fresh' if confidence > 0.8 else 'good'
        
        # Estimer la date d'expiration
        expiration_date = estimate_expiration_date(best_food_type, condition)
        
        # Analyser les ingrédients
        ingredients = random.sample(FOOD_CATEGORIES.get(best_food_type, ['ingrédient']), min(3, len(FOOD_CATEGORIES.get(best_food_type, ['ingrédient']))))
        
        # Vérifier les allergènes
        allergens = check_allergens(ingredients)
        
        # Analyser les informations nutritionnelles
        nutritional_info = analyze_nutritional_info(best_food_type, ingredients)
        
        return {
            'food_type': best_food_type,
            'ingredients': ingredients,
            'expiration_date': expiration_date.isoformat() if expiration_date else None,
            'condition': condition,
            'confidence': float(confidence),
            'nutritional_info': nutritional_info,
            'allergens': allergens,
            'is_edible': condition != 'expired'
        }
        
    except Exception as e:
        logger.error(f"Erreur lors de la classification d'aliment: {e}")
        return None

def estimate_object_value(category, condition):
    """Estime la valeur d'un objet"""
    base_values = {
        'electronics': 100,
        'furniture': 50,
        'clothing': 20,
        'books': 10,
        'toys': 15,
        'sports': 30,
        'beauty': 25,
        'home': 20,
        'other': 10
    }
    
    condition_multipliers = {
        'excellent': 1.0,
        'good': 0.7,
        'fair': 0.4,
        'poor': 0.1
    }
    
    base_value = base_values.get(category, 10)
    multiplier = condition_multipliers.get(condition, 0.4)
    
    return int(base_value * multiplier)

def estimate_expiration_date(food_type, condition):
    """Estime la date d'expiration d'un aliment"""
    if condition == 'expired':
        return datetime.now() - timedelta(days=1)
    
    # Durées de conservation typiques (en jours)
    shelf_life = {
        'fruits': 7,
        'vegetables': 5,
        'dairy': 3,
        'meat': 2,
        'bakery': 3,
        'canned': 365,
        'beverages': 30,
        'snacks': 60,
        'other': 7
    }
    
    days = shelf_life.get(food_type, 7)
    return datetime.now() + timedelta(days=days)

def check_allergens(ingredients):
    """Vérifie les allergènes potentiels"""
    common_allergens = ['nuts', 'dairy', 'eggs', 'gluten', 'soy', 'shellfish']
    detected_allergens = []
    
    for ingredient in ingredients:
        for allergen in common_allergens:
            if allergen in ingredient.lower():
                detected_allergens.append(allergen)
    
    return list(set(detected_allergens))

def analyze_nutritional_info(food_type, ingredients):
    """Analyse les informations nutritionnelles"""
    # Valeurs nutritionnelles approximatives par type d'aliment
    nutritional_data = {
        'fruits': {'calories': 60, 'protein': 1, 'carbs': 15, 'fat': 0},
        'vegetables': {'calories': 25, 'protein': 2, 'carbs': 5, 'fat': 0},
        'dairy': {'calories': 150, 'protein': 8, 'carbs': 12, 'fat': 8},
        'meat': {'calories': 250, 'protein': 25, 'carbs': 0, 'fat': 15},
        'bakery': {'calories': 300, 'protein': 8, 'carbs': 50, 'fat': 10},
        'canned': {'calories': 100, 'protein': 5, 'carbs': 20, 'fat': 2},
        'beverages': {'calories': 50, 'protein': 0, 'carbs': 12, 'fat': 0},
        'snacks': {'calories': 200, 'protein': 4, 'carbs': 25, 'fat': 10}
    }
    
    return nutritional_data.get(food_type, {'calories': 100, 'protein': 3, 'carbs': 15, 'fat': 5})

def check_recyclability(category):
    """Vérifie si un objet est recyclable"""
    recyclable_categories = ['electronics', 'books', 'home']
    return category in recyclable_categories

def get_recycling_instructions(category):
    """Retourne les instructions de recyclage"""
    instructions = {
        'electronics': 'Apportez dans un point de collecte DEEE (Déchets d\'Équipements Électriques et Électroniques)',
        'books': 'Donnez à une bibliothèque ou association, ou recyclez le papier',
        'home': 'Vérifiez les consignes de tri de votre commune'
    }
    return instructions.get(category, 'Consultez les consignes de tri locales')

def generate_diy_instructions(object_category, object_name, object_description="", object_condition="good"):
    """Génère des instructions DIY intelligentes pour un objet"""
    
    # Base de données étendue de projets DIY
    diy_database = {
        'electronics': [
            {
                'title': 'Station de charge multi-appareils',
                'description': 'Transformez votre ancien appareil en station de charge élégante et fonctionnelle',
                'materials': ['Appareil électronique', 'Câbles USB (3-4)', 'Support en bois ou acrylique', 'Colle forte', 'Peinture (optionnel)', 'Ruban isolant'],
                'steps': [
                    'Nettoyez soigneusement l\'appareil et retirez les composants non nécessaires',
                    'Mesurez et découpez le support selon les dimensions de l\'appareil',
                    'Percez des trous pour les câbles USB dans le support',
                    'Installez et fixez les câbles USB avec de la colle',
                    'Assemblez le tout et testez la fonctionnalité',
                    'Peignez et décorez selon vos goûts (optionnel)'
                ],
                'difficulty': 'medium',
                'estimated_time': '2-3 heures',
                'skill_level': 'Intermédiaire',
                'eco_impact': 'Réduit les déchets électroniques et évite l\'achat de nouvelles stations',
                'tips': [
                    'Utilisez des câbles de qualité pour éviter les problèmes de charge',
                    'Testez chaque câble avant l\'assemblage final',
                    'Ventilez bien la pièce si vous utilisez de la colle forte'
                ],
                'tools_needed': ['Perceuse', 'Ciseaux', 'Pinceau', 'Règle'],
                'safety_notes': ['Débranchez l\'appareil avant de le modifier', 'Portez des gants lors de la manipulation']
            },
            {
                'title': 'Lampe de bureau LED',
                'description': 'Créez une lampe de bureau unique à partir d\'un ancien appareil électronique',
                'materials': ['Appareil électronique', 'LED strip ou ampoule LED', 'Interrupteur', 'Câble électrique', 'Support en métal', 'Vis et écrous'],
                'steps': [
                    'Démontez l\'appareil et retirez les composants internes',
                    'Installez la LED dans l\'espace disponible',
                    'Connectez l\'interrupteur et le câble électrique',
                    'Assemblez le support et fixez l\'appareil',
                    'Testez l\'éclairage et ajustez si nécessaire'
                ],
                'difficulty': 'hard',
                'estimated_time': '3-4 heures',
                'skill_level': 'Avancé',
                'eco_impact': 'Réutilise un appareil électronique et utilise des LED économes',
                'tips': ['Assurez-vous de bien isoler les connexions électriques', 'Choisissez une LED de couleur chaude pour un éclairage agréable']
            }
        ],
        'clothing': [
            {
                'title': 'Sac réutilisable personnalisé',
                'description': 'Transformez vos vêtements usagés en sacs réutilisables uniques',
                'materials': ['Vêtement en bon état', 'Fil solide', 'Aiguille', 'Ciseaux', 'Ruban ou corde', 'Boutons (optionnel)'],
                'steps': [
                    'Lavez et repassez le vêtement',
                    'Découpez selon le patron choisi (sac à main, tote bag, etc.)',
                    'Cousez les bords avec un point solide',
                    'Ajoutez des poignées en ruban ou corde',
                    'Décorez avec des boutons, broderies ou appliques',
                    'Testez la solidité en y mettant des objets lourds'
                ],
                'difficulty': 'easy',
                'estimated_time': '1-2 heures',
                'skill_level': 'Débutant',
                'eco_impact': 'Évite l\'achat de nouveaux sacs et réduit les déchets textiles',
                'tips': [
                    'Choisissez un tissu solide comme le denim ou la toile',
                    'Renforcez les points de tension avec des points doubles',
                    'Laissez des marges de couture suffisantes'
                ],
                'variations': ['Sac à provisions', 'Sac à dos', 'Trousses', 'Coussins décoratifs']
            },
            {
                'title': 'Patchwork créatif',
                'description': 'Créez un patchwork coloré à partir de vêtements usagés',
                'materials': ['Vêtements de différentes couleurs', 'Tissu de doublure', 'Fil assorti', 'Aiguille', 'Ciseaux', 'Règle'],
                'steps': [
                    'Découpez des carrés ou rectangles de taille égale',
                    'Arrangez les pièces selon le motif désiré',
                    'Cousez les pièces ensemble en commençant par les rangées',
                    'Assemblez les rangées pour former le patchwork',
                    'Ajoutez une doublure si nécessaire',
                    'Finissez les bords avec un ourlet'
                ],
                'difficulty': 'medium',
                'estimated_time': '2-3 heures',
                'skill_level': 'Intermédiaire',
                'eco_impact': 'Réutilise plusieurs vêtements et crée un objet unique'
            }
        ],
        'furniture': [
            {
                'title': 'Relooking complet de meuble',
                'description': 'Donnez une nouvelle vie à vos meubles anciens avec une transformation complète',
                'materials': ['Meuble à relooker', 'Peinture (primaire + couleur)', 'Pinceaux et rouleaux', 'Papier de verre (grain 120, 220)', 'Vernis ou cire', 'Pinceau à vernis'],
                'steps': [
                    'Démontez le meuble si possible (poignées, tiroirs)',
                    'Poncez toute la surface avec du papier de verre grain 120',
                    'Nettoyez et dépoussiérez soigneusement',
                    'Appliquez une sous-couche si nécessaire',
                    'Peignez avec la couleur choisie (2-3 couches fines)',
                    'Laissez sécher entre chaque couche',
                    'Appliquez une couche de vernis ou cire pour protéger',
                    'Remontez le meuble et ajoutez de nouveaux accessoires'
                ],
                'difficulty': 'medium',
                'estimated_time': '1-2 jours',
                'skill_level': 'Intermédiaire',
                'eco_impact': 'Évite l\'achat de nouveaux meubles et réduit les déchets',
                'tips': [
                    'Ventilez bien la pièce pendant la peinture',
                    'Appliquez plusieurs couches fines plutôt qu\'une couche épaisse',
                    'Testez la couleur sur une petite surface avant de peindre tout le meuble'
                ],
                'style_variations': ['Vintage', 'Moderne', 'Scandinave', 'Industriel', 'Bohème']
            },
            {
                'title': 'Étagère murale récup',
                'description': 'Transformez des planches ou des caisses en étagère murale design',
                'materials': ['Planches de récupération', 'Vis et chevilles', 'Perceuse', 'Niveau', 'Peinture (optionnel)', 'Cire ou vernis'],
                'steps': [
                    'Mesurez l\'espace disponible et planifiez la disposition',
                    'Découpez les planches aux bonnes dimensions',
                    'Poncez et traitez le bois (cire ou vernis)',
                    'Marquez les emplacements de fixation au mur',
                    'Percez les trous et installez les chevilles',
                    'Fixez les planches au mur avec des vis',
                    'Vérifiez le niveau et ajustez si nécessaire'
                ],
                'difficulty': 'medium',
                'estimated_time': '2-3 heures',
                'skill_level': 'Intermédiaire',
                'eco_impact': 'Réutilise du bois et évite l\'achat de nouvelles étagères'
            }
        ],
        'books': [
            {
                'title': 'Bibliothèque créative',
                'description': 'Transformez vos livres en éléments décoratifs et fonctionnels',
                'materials': ['Livres anciens', 'Colle forte', 'Ciseaux', 'Peinture (optionnel)', 'Ruban décoratif'],
                'steps': [
                    'Sélectionnez des livres de même taille',
                    'Collez les pages ensemble pour créer des blocs solides',
                    'Découpez selon la forme désirée (coffret, support, etc.)',
                    'Peignez ou décorez selon vos goûts',
                    'Ajoutez des éléments décoratifs (ruban, boutons)'
                ],
                'difficulty': 'easy',
                'estimated_time': '1-2 heures',
                'skill_level': 'Débutant',
                'eco_impact': 'Réutilise des livres non lus et crée des objets décoratifs'
            }
        ],
        'toys': [
            {
                'title': 'Jardin de jouets',
                'description': 'Créez un jardin miniature avec des jouets usagés',
                'materials': ['Jouets en plastique', 'Terreau', 'Petites plantes', 'Conteneur', 'Gravier décoratif', 'Petits accessoires'],
                'steps': [
                    'Nettoyez soigneusement les jouets',
                    'Préparez le conteneur avec des trous de drainage',
                    'Ajoutez une couche de gravier puis de terreau',
                    'Plantez les petites plantes',
                    'Disposez les jouets comme éléments décoratifs',
                    'Ajoutez du gravier décoratif pour finir'
                ],
                'difficulty': 'easy',
                'estimated_time': '1 heure',
                'skill_level': 'Débutant',
                'eco_impact': 'Réutilise des jouets et crée un jardin miniature'
            }
        ]
    }
    
    # Sélectionner les projets selon la catégorie
    available_projects = diy_database.get(object_category, [
        {
            'title': 'Projet créatif général',
            'description': 'Laissez libre cours à votre créativité avec cet objet',
            'materials': ['Matériaux de base', 'Outils appropriés', 'Colle ou fixations'],
            'steps': [
                'Analysez l\'objet et ses possibilités',
                'Imaginez une nouvelle fonction ou utilisation',
                'Planifiez la transformation étape par étape',
                'Rassemblez les matériaux nécessaires',
                'Réalisez votre projet avec patience',
                'Testez et ajustez si nécessaire'
            ],
            'difficulty': 'medium',
            'estimated_time': 'Variable',
            'skill_level': 'Débutant',
            'eco_impact': 'Réduit les déchets et encourage la créativité',
            'tips': ['Soyez créatif et n\'ayez pas peur d\'expérimenter', 'Testez vos idées sur une petite échelle d\'abord']
        }
    ])
    
    # Adapter les projets selon l'état de l'objet
    adapted_projects = []
    for project in available_projects:
        adapted_project = project.copy()
        
        # Adapter selon l'état
        if object_condition == 'poor':
            adapted_project['difficulty'] = 'easy'  # Projets plus simples pour objets en mauvais état
            adapted_project['tips'] = adapted_project.get('tips', []) + [
                'L\'objet étant en mauvais état, privilégiez les transformations simples',
                'Nettoyez soigneusement avant de commencer'
            ]
        elif object_condition == 'excellent':
            adapted_project['tips'] = adapted_project.get('tips', []) + [
                'L\'objet étant en excellent état, vous pouvez vous permettre des transformations plus complexes'
            ]
        
        # Adapter selon le nom/description
        if object_name and any(word in object_name.lower() for word in ['table', 'chaise', 'bureau']):
            if object_category != 'furniture':
                adapted_project['title'] = f"Transformation de {object_name}"
                adapted_project['description'] = f"Donnez une nouvelle vie à votre {object_name}"
        
        adapted_projects.append(adapted_project)
    
    return adapted_projects

def generate_recipe_instructions(food_type, ingredients):
    """Génère des recettes basées sur les ingrédients"""
    recipes = {
        'fruits': [
            {
                'title': 'Smoothie aux fruits',
                'description': 'Un smoothie rafraîchissant et nutritif',
                'ingredients': ingredients + ['Yaourt', 'Miel'],
                'instructions': [
                    'Lavez et coupez les fruits',
                    'Mettez dans un mixeur',
                    'Ajoutez le yaourt et le miel',
                    'Mixez jusqu\'à obtenir une texture lisse'
                ],
                'prep_time': '10 min',
                'cook_time': '0 min',
                'servings': 2,
                'difficulty': 'easy'
            }
        ],
        'vegetables': [
            {
                'title': 'Soupe de légumes',
                'description': 'Une soupe réconfortante et saine',
                'ingredients': ingredients + ['Bouillon', 'Herbes'],
                'instructions': [
                    'Lavez et coupez les légumes',
                    'Faites revenir dans une casserole',
                    'Ajoutez le bouillon',
                    'Laissez mijoter 20 minutes'
                ],
                'prep_time': '15 min',
                'cook_time': '25 min',
                'servings': 4,
                'difficulty': 'easy'
            }
        ]
    }
    
    return recipes.get(food_type, [
        {
            'title': 'Recette créative',
            'description': 'Une recette utilisant vos ingrédients',
            'ingredients': ingredients,
            'instructions': [
                'Préparez tous les ingrédients',
                'Suivez votre inspiration',
                'Assaisonnez selon vos goûts',
                'Dégustez votre création'
            ],
            'prep_time': '15 min',
            'cook_time': '30 min',
            'servings': 4,
            'difficulty': 'medium'
        }
    ])

# Routes API
@app.route('/health', methods=['GET'])
def health_check():
    """Vérification de l'état du service"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'models_loaded': True  # Version mock
    })

@app.route('/predict_object', methods=['POST'])
def predict_object():
    """Endpoint pour classifier un objet"""
    try:
        data = request.get_json()
        image_url = data.get('image_url')
        
        if not image_url:
            return jsonify({'error': 'URL d\'image requise'}), 400
        
        result = enhanced_classify_object(image_url)
        
        if result is None:
            return jsonify({'error': 'Erreur lors de la classification'}), 500
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Erreur dans predict_object: {e}")
        return jsonify({'error': 'Erreur interne du serveur'}), 500

@app.route('/classify-object', methods=['POST'])
def classify_object_endpoint():
    """Endpoint pour classifier un objet (alias pour predict_object)"""
    try:
        # Vérifier si une image est fournie dans les fichiers
        if 'image' in request.files:
            file = request.files['image']
            if file.filename == '':
                return jsonify({'error': 'Aucun fichier sélectionné'}), 400
            
            # Lire l'image
            image_data = file.read()
            image = Image.open(io.BytesIO(image_data))
            
            # Classifier l'objet
            result = classify_object(image)
            return jsonify(result)
        
        # Vérifier si une URL d'image est fournie
        data = request.get_json()
        if data and 'image_url' in data:
            image_url = data.get('image_url')
            result = enhanced_classify_object(image_url)
            
            if result is None:
                return jsonify({'error': 'Erreur lors de la classification'}), 500
            
            return jsonify(result)
        
        return jsonify({'error': 'Aucune image fournie'}), 400
        
    except Exception as e:
        logger.error(f"Erreur dans classify_object_endpoint: {e}")
        return jsonify({'error': 'Erreur interne du serveur'}), 500

@app.route('/predict_food', methods=['POST'])
def predict_food():
    """Endpoint pour classifier un aliment"""
    try:
        data = request.get_json()
        image_url = data.get('image_url')
        
        if not image_url:
            return jsonify({'error': 'URL d\'image requise'}), 400
        
        result = mock_classify_food(image_url)
        
        if result is None:
            return jsonify({'error': 'Erreur lors de la classification'}), 500
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Erreur dans predict_food: {e}")
        return jsonify({'error': 'Erreur interne du serveur'}), 500

@app.route('/classify-food', methods=['POST'])
def classify_food_endpoint():
    """Endpoint pour classifier un aliment (alias pour predict_food)"""
    try:
        # Vérifier si une image est fournie dans les fichiers
        if 'image' in request.files:
            file = request.files['image']
            if file.filename == '':
                return jsonify({'error': 'Aucun fichier sélectionné'}), 400
            
            # Lire l'image
            image_data = file.read()
            image = Image.open(io.BytesIO(image_data))
            
            # Classifier l'aliment
            result = classify_food(image)
            return jsonify(result)
        
        # Vérifier si une URL d'image est fournie
        data = request.get_json()
        if data and 'image_url' in data:
            image_url = data.get('image_url')
            result = mock_classify_food(image_url)
            
            if result is None:
                return jsonify({'error': 'Erreur lors de la classification'}), 500
            
            return jsonify(result)
        
        return jsonify({'error': 'Aucune image fournie'}), 400
        
    except Exception as e:
        logger.error(f"Erreur dans classify_food_endpoint: {e}")
        return jsonify({'error': 'Erreur interne du serveur'}), 500

@app.route('/generate_diy', methods=['POST'])
def generate_diy():
    """Endpoint pour générer des instructions DIY"""
    try:
        data = request.get_json()
        category = data.get('category')
        object_name = data.get('object_name', 'objet')
        object_description = data.get('description', '')
        object_condition = data.get('condition', 'good')
        
        if not category:
            return jsonify({'error': 'Catégorie requise'}), 400
        
        diy_instructions = generate_diy_instructions(category, object_name, object_description, object_condition)
        
        return jsonify({
            'success': True,
            'diy_projects': diy_instructions
        })
        
    except Exception as e:
        logger.error(f"Erreur dans generate_diy: {e}")
        return jsonify({'error': 'Erreur interne du serveur'}), 500

@app.route('/generate_recipe', methods=['POST'])
def generate_recipe():
    """Endpoint pour générer des recettes"""
    try:
        data = request.get_json()
        food_type = data.get('food_type')
        ingredients = data.get('ingredients', [])
        
        if not food_type:
            return jsonify({'error': 'Type d\'aliment requis'}), 400
        
        recipes = generate_recipe_instructions(food_type, ingredients)
        
        return jsonify({
            'recipes': recipes
        })
        
    except Exception as e:
        logger.error(f"Erreur dans generate_recipe: {e}")
        return jsonify({'error': 'Erreur interne du serveur'}), 500

@app.route('/estimate_value', methods=['POST'])
def estimate_value():
    """Endpoint pour estimer la valeur d'un objet"""
    try:
        data = request.get_json()
        category = data.get('category')
        condition = data.get('condition', 'good')
        
        if not category:
            return jsonify({'error': 'Catégorie requise'}), 400
        
        value = estimate_object_value(category, condition)
        
        return jsonify({
            'estimated_value': value,
            'currency': 'EUR'
        })
        
    except Exception as e:
        logger.error(f"Erreur dans estimate_value: {e}")
        return jsonify({'error': 'Erreur interne du serveur'}), 500

@app.route('/check_recyclability', methods=['POST'])
def check_recyclability_endpoint():
    """Endpoint pour vérifier la recyclabilité"""
    try:
        data = request.get_json()
        category = data.get('category')
        
        if not category:
            return jsonify({'error': 'Catégorie requise'}), 400
        
        is_recyclable = check_recyclability(category)
        instructions = get_recycling_instructions(category) if is_recyclable else None
        
        return jsonify({
            'is_recyclable': is_recyclable,
            'instructions': instructions
        })
        
    except Exception as e:
        logger.error(f"Erreur dans check_recyclability: {e}")
        return jsonify({'error': 'Erreur interne du serveur'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Route non trouvée', 'available_routes': [
        '/health',
        '/predict_object',
        '/classify-object',
        '/predict_food',
        '/classify-food', 
        '/generate_diy',
        '/generate_recipe',
        '/estimate_value',
        '/check_recyclability'
    ]}), 404

if __name__ == '__main__':
    import os
    port = app.config['PORT']
    app.run(host='0.0.0.0', port=port, debug=True)