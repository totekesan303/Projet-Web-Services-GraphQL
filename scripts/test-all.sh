#!/bin/bash

echo "==========================================="
echo "  Tests Smart Traffic Platform"
echo "==========================================="
echo ""

# Test health endpoints
echo "[1/7] Test des endpoints health..."
for port in 4001 4002 4003 4004 4005 4000; do
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/health || echo "000")
    if [ "$response" = "200" ]; then
        echo "  ✓ Port $port: OK"
    else
        echo "  ✗ Port $port: ERREUR ($response)"
    fi
done

# Test GraphQL
echo ""
echo "[2/7] Test GraphQL Auth Service..."
curl -s -X POST http://localhost:4001/graphql   -H "Content-Type: application/json"   -d '{"query": "query { __typename }"}' | grep -q "data" && echo "  ✓ Auth GraphQL OK" || echo "  ✗ Auth GraphQL ERREUR"

echo ""
echo "[3/7] Test GraphQL Vehicle Service..."
curl -s -X POST http://localhost:4002/graphql   -H "Content-Type: application/json"   -d '{"query": "query { __typename }"}' | grep -q "data" && echo "  ✓ Vehicle GraphQL OK" || echo "  ✗ Vehicle GraphQL ERREUR"

echo ""
echo "[4/7] Test GraphQL Traffic Service..."
curl -s -X POST http://localhost:4003/graphql   -H "Content-Type: application/json"   -d '{"query": "query { __typename }"}' | grep -q "data" && echo "  ✓ Traffic GraphQL OK" || echo "  ✗ Traffic GraphQL ERREUR"

echo ""
echo "[5/7] Test GraphQL Incident Service..."
curl -s -X POST http://localhost:4004/graphql   -H "Content-Type: application/json"   -d '{"query": "query { __typename }"}' | grep -q "data" && echo "  ✓ Incident GraphQL OK" || echo "  ✗ Incident GraphQL ERREUR"

echo ""
echo "[6/7] Test GraphQL Notification Service..."
curl -s -X POST http://localhost:4005/graphql   -H "Content-Type: application/json"   -d '{"query": "query { __typename }"}' | grep -q "data" && echo "  ✓ Notification GraphQL OK" || echo "  ✗ Notification GraphQL ERREUR"

echo ""
echo "[7/7] Test Gateway Federation..."
curl -s -X POST http://localhost:4000/graphql   -H "Content-Type: application/json"   -d '{"query": "query { __typename }"}' | grep -q "data" && echo "  ✓ Gateway Federation OK" || echo "  ✗ Gateway Federation ERREUR"

echo ""
echo "==========================================="
echo "  Tests termines!"
echo "==========================================="
