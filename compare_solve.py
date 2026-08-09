import os
import requests
import pymysql
import numpy as np
import json

def get_or_create_test_problem():
    conn = pymysql.connect(
        host=os.environ.get('SPEAR_DB_HOST', 'localhost'),
        user=os.environ.get('SPEAR_DB_USER', 'root'),
        password=os.environ.get('SPEAR_DB_PASSWORD', ''),
        database=os.environ.get('SPEAR_DB_NAME', 'spear'),
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
    )
    cursor = conn.cursor()
    
    # Check if a user exists
    cursor.execute("SELECT id FROM usuario LIMIT 1")
    user = cursor.fetchone()
    if not user:
        cursor.execute("INSERT INTO usuario (email, password) VALUES ('test@example.com', 'test')")
        uid = cursor.lastrowid
    else:
        uid = user['id']
        
    # Check if a problem exists
    cursor.execute("SELECT id, nome_problema, racionalidade FROM problema ORDER BY id DESC LIMIT 1")
    prob = cursor.fetchone()
    
    if not prob:
        # Create a sample problem: 3 alternatives, 3 criteria
        cursor.execute("INSERT INTO problema (nome_problema, ID_usuario, racionalidade) VALUES ('Test Problem', %s, 'compensatory')", (uid,))
        pid = cursor.lastrowid
        
        # Criteria: Cost (Min, 3 levels), Quality (Max, 5 levels), Delivery (Max, 3 levels)
        crits = [
            ("Cost", 0, 3), # min
            ("Quality", 1, 5), # max
            ("Delivery", 1, 3) # max
        ]
        crit_ids = []
        for name, ctype, levels in crits:
            cursor.execute("INSERT INTO criterio (nome_criterio, tipo_criterio, niveis, ID_problema) VALUES (%s, %s, %s, %s)", (name, ctype, levels, pid))
            crit_ids.append(cursor.lastrowid)
            
        # Alternatives: Alt A, Alt B, Alt C
        alts = ["Alt A", "Alt B", "Alt C"]
        alt_ids = []
        for name in alts:
            cursor.execute("INSERT INTO alternativa (nome_alternativa, ID_problema) VALUES (%s, %s)", (name, pid))
            alt_ids.append(cursor.lastrowid)
            
        # Consequences Matrix
        # Alt A: Cost=2, Quality=4, Delivery=2
        # Alt B: Cost=1, Quality=3, Delivery=3
        # Alt C: Cost=3, Quality=5, Delivery=1
        matrix = [
            [2.0, 4.0, 2.0],
            [1.0, 3.0, 3.0],
            [3.0, 5.0, 1.0]
        ]
        for i, alt_id in enumerate(alt_ids):
            for j, crit_id in enumerate(crit_ids):
                cursor.execute(
                    "INSERT INTO matrizconsequencia (ID_alternativa, ID_criterio, valor_performance, ID_problema) VALUES (%s, %s, %s, %s)",
                    (alt_id, crit_id, matrix[i][j], pid)
                )
        print("Created new test problem in MySQL.")
        prob = {"id": pid, "nome_problema": "Test Problem", "racionalidade": "compensatory"}
    else:
        pid = prob['id']
        print(f"Using existing problem ID {pid}: {prob['nome_problema']}")
        
    # Fetch criteria
    cursor.execute("SELECT * FROM criterio WHERE ID_problema = %s ORDER BY id", (pid,))
    crits = cursor.fetchall()
    nomes_crit = [c['nome_criterio'] for c in crits]
    tipocrit = [c['tipo_criterio'] for c in crits]
    niveis = [c['niveis'] for c in crits]
    
    # Fetch alternatives
    cursor.execute("SELECT * FROM alternativa WHERE ID_problema = %s ORDER BY id", (pid,))
    alts = cursor.fetchall()
    nomes_alt = [a['nome_alternativa'] for a in alts]
    
    # Fetch matrix
    num_crit = len(crits)
    num_alt = len(alts)
    matriz_conseq = np.zeros((num_alt, num_crit))
    for i, alt in enumerate(alts):
        for j, crit in enumerate(crits):
            cursor.execute(
                "SELECT valor_performance FROM matrizconsequencia WHERE ID_problema = %s AND ID_alternativa = %s AND ID_criterio = %s",
                (pid, alt['id'], crit['id'])
            )
            val = cursor.fetchone()
            if val:
                matriz_conseq[i, j] = val['valor_performance']
                
    conn.close()
    
    payload = {
        "problemName": prob['nome_problema'],
        "rationality": prob['racionalidade'],
        "numCrit": num_crit,
        "numAlt": num_alt,
        "nomeCrit": nomes_crit,
        "tipoCrit": tipocrit,
        "niveisCrit": niveis,
        "nomeAlt": nomes_alt,
        "matrizConseq": matriz_conseq.tolist(),
        "rankFilters": [None] * num_crit,
        "holisticEvaluations": [],
        "decompositionPreferences": [],
        "excludedPairs": []
    }
    return payload

def run_tests():
    payload = get_or_create_test_problem()
    
    print("\n--- Payload to solve ---")
    print(json.dumps(payload, indent=2))
    
    # Test Delphi Server
    print("\n--- Querying Delphi Server (Port 8888) ---")
    try:
        res = requests.post("http://127.0.0.1:8888/api/solve", json=payload)
        print("Delphi HTTP Status:", res.status_code)
        delphi_data = res.json()
        print("Delphi Response success:", delphi_data.get("success"))
        if delphi_data.get("success"):
            print("Delphi Total cases:", delphi_data["roc"]["totalCases"])
            print("Delphi recommended alternatives:", delphi_data["roc"]["decisionRule"]["recommended_alts"])
            print("Delphi recommended probability:", delphi_data["roc"]["decisionRule"]["probability"])
            print("Delphi unique solutions:", delphi_data["roc"]["matrizSol"])
            print("Delphi frequencies:", delphi_data["roc"]["resultSol"])
            print("Delphi decompositionQuestion:", delphi_data.get("decompositionQuestion"))
        else:
            print("Delphi Error:", delphi_data.get("error"))
    except Exception as e:
        print("Error connecting to Delphi server:", e)

if __name__ == '__main__':
    run_tests()
