#!/usr/bin/env bash
# Cheap Azure RSVP API: Consumption plan + LRS storage, no Application Insights.
# Expected cost for 10 days / ~150 posts: well under $2, often cents.
set -euo pipefail

RG="${RG:-bday-rsvp-rg}"
LOC="${LOC:-southeastasia}"
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
BUILD="$(mktemp -d -t rsvp-api)"
ZIP="$(mktemp -t rsvp-api).zip"
trap 'rm -rf "$BUILD" "$ZIP"' EXIT

echo "Using $RG, deploying $STOR / $APP in $LOC"
if ! az group show -n "$RG" --output none 2>/dev/null; then
  az group create -n "$RG" -l "$LOC" --output none
fi
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

mkdir -p "$BUILD/.python_packages/lib/site-packages"
cp "$ROOT/function_app.py" "$ROOT/host.json" "$ROOT/requirements.txt" "$BUILD/"
python3 -m pip install \
  --quiet \
  --target "$BUILD/.python_packages/lib/site-packages" \
  --platform manylinux2014_x86_64 \
  --implementation cp \
  --python-version 3.11 \
  --only-binary=:all: \
  --no-compile \
  -r "$ROOT/requirements.txt"
(
  cd "$BUILD"
  zip -qr "$ZIP" .
)
az functionapp config appsettings set -g "$RG" -n "$APP" --settings \
  AzureWebJobsFeatureFlags=EnableWorkerIndexing \
  SCM_DO_BUILD_DURING_DEPLOYMENT=false \
  ENABLE_ORYX_BUILD=false \
  --output none
az functionapp deployment source config-zip -g "$RG" -n "$APP" --src "$ZIP" --build-remote false --output none

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

BASE="https://${APP}.azurewebsites.net/api"
URL="${BASE}/rsvp"
echo
echo "API POST: $URL"
echo "Download CSV: ${URL}?key=${ADMIN}"
echo
echo "Put this in js/config.js:"
echo "  rsvpApi: \"${URL}\","
echo "  pinterestApi: \"${BASE}/pinterest\","
echo
echo "After the party:"
echo "  az group delete -n $RG --yes --no-wait"
