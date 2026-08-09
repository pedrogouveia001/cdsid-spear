import subprocess
import time
import requests
import threading
import sys

def read_stream(stream, prefix):
    for line in iter(stream.readline, b''):
        print(f"{prefix}: {line.decode('utf-8', errors='ignore').rstrip()}")

def run_debug():
    print("Starting SPEAR.exe...")
    proc = subprocess.Popen(
        [r".\SPEAR.exe"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    t_out = threading.Thread(target=read_stream, args=(proc.stdout, "[STDOUT]"))
    t_err = threading.Thread(target=read_stream, args=(proc.stderr, "[STDERR]"))
    t_out.daemon = True
    t_err.daemon = True
    t_out.start()
    t_err.start()
    
    # Wait for server to start
    time.sleep(2)
    
    payload = {
        "problemName": "Test Problem",
        "rationality": "compensatory",
        "numCrit": 3,
        "numAlt": 3,
        "nomeCrit": ["Cost", "Quality", "Delivery"],
        "tipoCrit": [0, 1, 1],
        "niveisCrit": [3, 5, 3],
        "nomeAlt": ["Alt A", "Alt B", "Alt C"],
        "matrizConseq": [
            [2.0, 4.0, 2.0],
            [1.0, 3.0, 3.0],
            [3.0, 5.0, 1.0]
        ],
        "rankFilters": [-1, -1, -1],
        "holisticEvaluations": [],
        "decompositionPreferences": [],
        "excludedPairs": []
    }
    
    print("\nSending API request...")
    try:
        res = requests.post("http://127.0.0.1:8888/api/solve", json=payload, timeout=5)
        print("HTTP Status Code:", res.status_code)
        print("Response headers:", res.headers)
        print("Response content:", res.text)
    except Exception as e:
        print("Request failed:", e)
        
    time.sleep(2)
    print("Terminating SPEAR.exe...")
    proc.terminate()
    try:
        proc.wait(timeout=2)
    except:
        proc.kill()
    print("Done.")

if __name__ == '__main__':
    run_debug()
