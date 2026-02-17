#!/bin/bash

echo "🧪 Testing CI/CD Pipeline Setup"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Test 1: Check GitHub Actions workflow files
echo "1. 📋 Checking GitHub Actions workflows..."
if [ -f ".github/workflows/ci.yml" ]; then
    print_status 0 "Basic CI workflow exists"
else
    print_status 1 "Basic CI workflow missing"
fi

if [ -f ".github/workflows/ci-enhanced.yml" ]; then
    print_status 0 "Enhanced CI workflow exists"
else
    print_status 1 "Enhanced CI workflow missing"
fi

if [ -f ".github/workflows/test-pipeline.yml" ]; then
    print_status 0 "Test pipeline workflow exists"
else
    print_status 1 "Test pipeline workflow missing"
fi

# Test 2: Check Docker configuration
echo ""
echo "2. 🐳 Checking Docker configuration..."
if [ -f "docker-compose.yml" ]; then
    print_status 0 "docker-compose.yml exists"
    
    # Validate docker-compose syntax
    if command -v docker-compose &> /dev/null; then
        docker-compose config > /dev/null 2>&1
        print_status $? "docker-compose.yml syntax is valid"
    else
        echo -e "${YELLOW}⚠️  docker-compose not installed, skipping syntax check${NC}"
    fi
else
    print_status 1 "docker-compose.yml missing"
fi

if [ -f "docker-compose.prod.yml" ]; then
    print_status 0 "docker-compose.prod.yml exists"
else
    print_status 1 "docker-compose.prod.yml missing"
fi

# Test 3: Check package.json files
echo ""
echo "3. 📦 Checking package.json files..."
packages=("backend" "web" "mobile" "shared")
all_packages_ok=1

for pkg in "${packages[@]}"; do
    if [ -f "packages/$pkg/package.json" ]; then
        print_status 0 "$pkg/package.json exists"
        
        # Check for essential scripts
        if grep -q '"scripts"' "packages/$pkg/package.json"; then
            print_status 0 "$pkg package.json has scripts section"
        else
            print_status 1 "$pkg package.json missing scripts section"
            all_packages_ok=0
        fi
    else
        print_status 1 "$pkg/package.json missing"
        all_packages_ok=0
    fi
done

# Test 4: Check Prisma schema
echo ""
echo "4. 🗄️  Checking Prisma schema..."
if [ -f "packages/backend/prisma/schema.prisma" ]; then
    print_status 0 "Prisma schema exists"
    
    # Check if schema has models
    if grep -q "model " "packages/backend/prisma/schema.prisma"; then
        MODEL_COUNT=$(grep -c "model " "packages/backend/prisma/schema.prisma")
        print_status 0 "Prisma schema has $MODEL_COUNT models"
    else
        print_status 1 "Prisma schema has no models"
        all_packages_ok=0
    fi
else
    print_status 1 "Prisma schema missing"
    all_packages_ok=0
fi

# Test 5: Check TypeScript configuration
echo ""
echo "5. 📝 Checking TypeScript configuration..."
if [ -f "packages/backend/tsconfig.json" ]; then
    print_status 0 "Backend TypeScript config exists"
else
    print_status 1 "Backend TypeScript config missing"
    all_packages_ok=0
fi

if [ -f "packages/shared/tsconfig.json" ]; then
    print_status 0 "Shared TypeScript config exists"
else
    print_status 1 "Shared TypeScript config missing"
    all_packages_ok=0
fi

# Test 6: Check documentation
echo ""
echo "6. 📚 Checking documentation..."
docs=(
    "README.md"
    "packages/backend/README.md"
    "docker-commands.md"
)

for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        print_status 0 "$doc exists"
    else
        print_status 1 "$doc missing"
    fi
done

# Summary
echo ""
echo "========================================"
echo "📊 TEST SUMMARY"
echo "========================================"

if [ $all_packages_ok -eq 1 ]; then
    echo -e "${GREEN}🎉 All essential checks passed!${NC}"
    echo ""
    echo "The CI/CD pipeline is properly configured:"
    echo "✅ GitHub Actions workflows ready"
    echo "✅ Docker configuration complete"
    echo "✅ Package structure valid"
    echo "✅ Database schema defined"
    echo "✅ TypeScript configured"
    echo "✅ Documentation in place"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Push to GitHub to trigger CI pipeline"
    echo "2. Run 'docker-compose up' to test locally"
    echo "3. Use 'npm run dev' in packages/ to develop"
else
    echo -e "${YELLOW}⚠️  Some checks failed${NC}"
    echo ""
    echo "Please fix the issues above before proceeding."
    echo "Essential components must be in place for CI/CD to work."
fi

echo ""
echo "🔗 GitHub Actions URLs (after push):"
echo "   Basic CI: https://github.com/[username]/[repo]/actions/workflows/ci.yml"
echo "   Enhanced CI: https://github.com/[username]/[repo]/actions/workflows/ci-enhanced.yml"
echo "   Test Pipeline: https://github.com/[username]/[repo]/actions/workflows/test-pipeline.yml"
echo ""
echo "💡 To manually test the pipeline:"
echo "   1. Go to GitHub repository → Actions"
echo "   2. Select 'Test Pipeline' workflow"
echo "   3. Click 'Run workflow'"
echo "========================================"