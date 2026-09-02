#!/usr/bin/env bash
# Cheap Azure RSVP API: Consumption plan + LRS storage, no Application Insights.
# Expected cost for 10 days / ~150 posts: well under $2, often cents.
set -euo pipefail

RG="${RG:-bday-rsvp-rg}"
LOC="${LOC:-centralindia}"
APP="${APP:-}"
STOR="${STOR:-}"
ADMIN="${RSVP_ADMIN_KEY:-}"

if ! command -v az >/dev/null; then
  echo "Install Azure CLI first: https://aka.ms/installazurecli"
  exit 1
fi

az account show >/dev/null

if [[ -z "$STOR" ]]; then
  STOR="bdayrsvp$(openssl rand -hex 3)"
fi
if [[ -z "$APP" ]]; then
  APP="bday-rsvp-$(openssl rand -hex 3)"
fi
if [[ -z "$ADMIN" ]]; then
  ADMIN="$(openssl rand -hex 8)"
fi

ROOT="$(cd "$(dirname "$0")" && pwd)"
ZIP="$(mktemp -t rsvp-api).zip"
trap 'rm -f "$ZIP"' EXIT

echo "Creating $RG in $LOC (storage $STOR, app $APP)"
az group create -n "$RG" -l "$LOC" --output none
az storage account create \
  -n "$STOR" -g "$RG" -l "$LOC" \
  --sku Standard_LRS --kind StorageV2 \
  --min-tls-version TLS1_2 \
  --allow-blob-public-access false \
  --output none
az functionapp create \
  -n "$APP" -g "$RG" \
  --storage-account "$STOR" \
  --consumption-plan-location "$LOC" \
  --runtime python --runtime-version 3.11 \
  --functions-version 4 --os-type Linux \
  --disable-app-insights true \
  --output none
az functionapp cors add -g "$RG" -n "$APP" --allowed-origins "*" --output none
az functionapp config appsettings set -g "$RG" -n "$APP" --settings \
  RSVP_ADMIN_KEY="$ADMIN" \
  APPLICATIONINSIGHTS_CONNECTION_STRING="" \
  --output none

(
  cd "$ROOT"
  zip -q "$ZIP" function_app.py host.json requirements.txt
)
az functionapp deployment source config-zip -g "$RG" -n "$APP" --src "$ZIP" --output none

# Cap surprise spend. $2 is plenty for this workload.
az consumption budget create \
  --budget-name "bday-rsvp-cap" \
  --amount 2 \
  --time-grain Monthly \
  --category Cost \
  --resource-group "$RG" \
  --start-date "$(date +%Y-%m-01)" \
  --end-date "$(date -v+1m +%Y-%m-01 2>/dev/null || date -d '+1 month' +%Y-%m-01)" \
  --output none 2>/dev/null || echo "Budget alert skipped (needs billing owner). Set a \$2 budget on this resource group in the Azure portal."

URL="https://${APP}.azurewebsites.net/api/rsvp"
echo
echo "API POST: $URL"
echo "Download CSV: ${URL}?key=${ADMIN}"
echo
echo "Put this in js/config.js:"
echo "  rsvpApi: \"${URL}\","
echo
echo "After the party:"
echo "  az group delete -n $RG --yes --no-wait"
