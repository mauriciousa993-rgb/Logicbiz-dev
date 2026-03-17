#!/usr/bin/env bash
set -euo pipefail

base_url="${1:-http://localhost:3000}"

echo "GET ${base_url}/api/projects"
curl -sS -D - "${base_url}/api/projects" -o /dev/null | grep -i "^x-projects-storage:" || true

echo
echo "Tip: para probar mutaciones (POST/PUT/DELETE) entra primero a ${base_url}/admin para que el navegador guarde las credenciales Basic Auth."
echo "Luego, usa el panel admin y refresca el home para confirmar persistencia."
