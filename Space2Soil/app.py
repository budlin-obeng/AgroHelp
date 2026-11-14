"""
Space2Soil: Interactive Web Application Server & API Gateway
NASA Space Apps Challenge: Field Shift — Adapting Farms with NASA Data

Runs a lightweight, zero-dependency HTTP server that serves the interactive
Space2Soil web cockpit and exposes REST API endpoints for downstream systems.
"""

import os
import sys
import json
import argparse
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler
import socket

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(BASE_DIR, 'web')
DATA_DIR = os.path.join(BASE_DIR, 'data')

class Space2SoilRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)

    def do_GET(self):
        # REST API Endpoints
        if self.path == '/api/health':
            self.send_json_response({"status": "OK", "service": "Space2Soil Decision Platform", "version": "1.0.0"})
            return
            
        elif self.path == '/api/telemetry':
            path = os.path.join(DATA_DIR, 'processed', 'analysis', 'crop_suitability_decadal_scores.csv')
            payload_path = os.path.join(WEB_DIR, 'assets', 'space2soil_full_data.json')
            if os.path.exists(payload_path):
                with open(payload_path, 'r') as f:
                    data = json.load(f)
                self.send_json_response(data.get("climatology_summary", {}))
            else:
                self.send_json_response({"error": "Telemetry not initialized"}, status=404)
            return

        elif self.path == '/api/scenarios':
            scores_path = os.path.join(DATA_DIR, 'processed', 'recommendations', 'scenario_detailed_scores.json')
            if os.path.exists(scores_path):
                with open(scores_path, 'r') as f:
                    data = json.load(f)
                self.send_json_response(data)
            else:
                self.send_json_response({"error": "Scenarios not found"}, status=404)
            return

        elif self.path == '/api/farmer-cards':
            cards_path = os.path.join(DATA_DIR, 'processed', 'recommendations', 'farmer_recommendation_cards.json')
            if os.path.exists(cards_path):
                with open(cards_path, 'r') as f:
                    data = json.load(f)
                self.send_json_response(data)
            else:
                self.send_json_response({"error": "Advisory cards not found"}, status=404)
            return

        elif self.path == '/api/suitability':
            matrix_path = os.path.join(DATA_DIR, 'processed', 'analysis', 'crop_suitability_matrix.csv')
            if os.path.exists(matrix_path):
                import pandas as pd
                df = pd.read_csv(matrix_path)
                self.send_json_response(df.to_dict(orient='records'))
            else:
                self.send_json_response({"error": "Suitability matrix not found"}, status=404)
            return

        # Serve static files from web/
        return super().do_GET()

    def send_json_response(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2).encode('utf-8'))

    def end_headers(self):
        # Enable CORS and caching headers
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def log_message(self, format, *args):
        # Suppress noisy standard request logs unless debugging
        sys.stderr.write("%s - - [%s] %s\n" %
                         (self.address_string(),
                          self.log_date_time_string(),
                          format%args))

def find_available_port(start_port=8501, max_attempts=50):
    for port in range(start_port, start_port + max_attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('127.0.0.1', port)) != 0:
                return port
    return start_port

def run_server(port=None, open_browser=False):
    if port is None:
        port = find_available_port(8501)
        
    server_address = ('127.0.0.1', port)
    httpd = HTTPServer(server_address, Space2SoilRequestHandler)
    
    url = f"http://127.0.0.1:{port}"
    print("=" * 70)
    print("   Space2Soil: NASA Earth Observation Agricultural Cockpit")
    print(f"   Local Server Running at: {url}")
    print(f"   REST API Gateway Active: {url}/api/telemetry")
    print(f"   Serving UI Assets from: {WEB_DIR}")
    print("   Press Ctrl+C to terminate.")
    print("=" * 70)

    if open_browser:
        webbrowser.open(url)
        
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nSpace2Soil server shut down cleanly.")
        httpd.server_close()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Space2Soil Web Application & REST Server")
    parser.add_argument('--port', type=int, default=8501, help="Port to bind server (default: 8501)")
    parser.add_argument('--open', action='store_true', help="Automatically launch default web browser")
    args = parser.parse_args()
    
    run_server(port=args.port, open_browser=args.open)
