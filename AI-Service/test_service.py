#!/usr/bin/env python3
"""
Script de test pour le service IA ECOSHARE
"""

import requests
import json
import time

def test_ai_service():
    """Teste les endpoints du service IA"""
    
    base_url = "http://localhost:5001"
    
    print("🧪 Test du service IA ECOSHARE")
    print("=" * 50)
    
    # Test 1: Vérifier que le service est en marche
    print("\n1. Test de connectivité...")
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Service IA accessible")
        else:
            print(f"❌ Service IA inaccessible (code: {response.status_code})")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion: {e}")
        return False
    
    # Test 2: Classification d'objet
    print("\n2. Test de classification d'objet...")
    test_data = {
        "image_url": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    }
    
    try:
        response = requests.post(
            f"{base_url}/classify_object",
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Classification d'objet réussie")
            print(f"   Catégorie: {result.get('category', 'N/A')}")
            print(f"   État: {result.get('condition', 'N/A')}")
            print(f"   Confiance: {result.get('confidence', 'N/A')}")
        else:
            print(f"❌ Erreur de classification (code: {response.status_code})")
            print(f"   Réponse: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur lors de la classification: {e}")
    
    # Test 3: Classification d'aliment
    print("\n3. Test de classification d'aliment...")
    test_data = {
        "image_url": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    }
    
    try:
        response = requests.post(
            f"{base_url}/classify_food",
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Classification d'aliment réussie")
            print(f"   Type: {result.get('type', 'N/A')}")
            print(f"   Fraîcheur: {result.get('freshness', 'N/A')}")
            print(f"   Confiance: {result.get('confidence', 'N/A')}")
        else:
            print(f"❌ Erreur de classification (code: {response.status_code})")
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur lors de la classification: {e}")
    
    # Test 4: Génération DIY
    print("\n4. Test de génération DIY...")
    test_data = {
        "category": "electronics",
        "object_name": "ancien téléphone",
        "description": "iPhone 6 en bon état",
        "condition": "good"
    }
    
    try:
        response = requests.post(
            f"{base_url}/generate_diy",
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Génération DIY réussie")
            if result.get('diy_projects'):
                print(f"   Nombre de projets: {len(result['diy_projects'])}")
                if result['diy_projects']:
                    project = result['diy_projects'][0]
                    print(f"   Premier projet: {project.get('title', 'N/A')}")
            else:
                print("   Aucun projet généré")
        else:
            print(f"❌ Erreur de génération DIY (code: {response.status_code})")
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur lors de la génération DIY: {e}")
    
    # Test 5: Génération de recette
    print("\n5. Test de génération de recette...")
    test_data = {
        "food_type": "fruits",
        "ingredients": ["pommes", "bananes", "fraises"]
    }
    
    try:
        response = requests.post(
            f"{base_url}/generate_recipe",
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Génération de recette réussie")
            if result.get('recipes'):
                print(f"   Nombre de recettes: {len(result['recipes'])}")
                if result['recipes']:
                    recipe = result['recipes'][0]
                    print(f"   Première recette: {recipe.get('title', 'N/A')}")
            else:
                print("   Aucune recette générée")
        else:
            print(f"❌ Erreur de génération de recette (code: {response.status_code})")
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur lors de la génération de recette: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Tests terminés !")
    
    return True

if __name__ == "__main__":
    # Attendre un peu que le service démarre
    print("⏳ Attente du démarrage du service...")
    time.sleep(3)
    
    test_ai_service()
