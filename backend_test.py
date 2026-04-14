import requests
import sys
import json
from datetime import datetime

class MedvetAPITester:
    def __init__(self, base_url="https://holistic-vet-shop.preview.emergentagent.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_token = None
        self.user_token = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, cookies=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {method} {url}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers, cookies=cookies)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers, cookies=cookies)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=test_headers, cookies=cookies)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=test_headers, cookies=cookies)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                if response.content:
                    try:
                        response_data = response.json()
                        if isinstance(response_data, list):
                            print(f"   Response: List with {len(response_data)} items")
                        elif isinstance(response_data, dict):
                            print(f"   Response keys: {list(response_data.keys())}")
                    except:
                        print(f"   Response: {response.text[:100]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")

            return success, response.json() if response.content and response.status_code < 400 else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_admin_login(self):
        """Test admin login and store cookies"""
        print("\n=== TESTING ADMIN LOGIN ===")
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@medvet.com", "password": "admin123"}
        )
        if success:
            # Store cookies for authenticated requests
            self.admin_cookies = self.session.cookies
            print(f"   Admin logged in: {response.get('name', 'Unknown')} ({response.get('role', 'user')})")
            return True
        return False

    def test_user_registration_and_login(self):
        """Test user registration and login"""
        print("\n=== TESTING USER REGISTRATION & LOGIN ===")
        test_email = f"test_{datetime.now().strftime('%H%M%S')}@medvet.com"
        
        # Register new user
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "name": "Test User",
                "email": test_email,
                "password": "test123",
                "phone": "(11) 99999-9999"
            }
        )
        
        if success:
            print(f"   User registered: {response.get('name')} ({response.get('email')})")
            self.user_cookies = self.session.cookies
            return True
        return False

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\n=== TESTING AUTH ENDPOINTS ===")
        
        # Test /auth/me with admin cookies
        self.run_test("Get Current User (Admin)", "GET", "auth/me", 200, cookies=self.admin_cookies)
        
        # Test logout
        self.run_test("Logout", "POST", "auth/logout", 200, cookies=self.admin_cookies)
        
        # Test refresh token (might fail after logout, that's expected)
        self.run_test("Refresh Token", "POST", "auth/refresh", 401, cookies=self.admin_cookies)

    def test_public_endpoints(self):
        """Test public endpoints that don't require authentication"""
        print("\n=== TESTING PUBLIC ENDPOINTS ===")
        
        # Test categories
        success, categories = self.run_test("Get Categories", "GET", "categories", 200)
        if success and categories:
            print(f"   Found {len(categories)} categories")
        
        # Test products
        success, products = self.run_test("Get Products", "GET", "products", 200)
        if success and products:
            print(f"   Found {len(products)} products")
            
        # Test products with category filter
        if categories:
            first_category = categories[0].get('slug', 'homeopatia')
            self.run_test(f"Get Products by Category ({first_category})", "GET", f"products?category={first_category}", 200)
        
        # Test testimonials
        success, testimonials = self.run_test("Get Testimonials", "GET", "testimonials", 200)
        if success and testimonials:
            print(f"   Found {len(testimonials)} testimonials")
        
        # Test FAQ
        success, faqs = self.run_test("Get FAQ", "GET", "faq", 200)
        if success and faqs:
            print(f"   Found {len(faqs)} FAQs")
        
        # Test tips
        success, tips = self.run_test("Get Tips", "GET", "tips", 200)
        if success and tips:
            print(f"   Found {len(tips)} tips")
            
            # Test individual tip
            if tips:
                first_tip_id = tips[0].get('id')
                if first_tip_id:
                    self.run_test(f"Get Tip by ID ({first_tip_id})", "GET", f"tips/{first_tip_id}", 200)

    def test_product_filtering_and_search(self):
        """Test new product filtering and search features"""
        print("\n=== TESTING PRODUCT FILTERING & SEARCH ===")
        
        # Test price filtering
        success, filtered_products = self.run_test(
            "Products with Price Filter (50-100)",
            "GET",
            "products?min_price=50&max_price=100",
            200
        )
        if success:
            print(f"   Found {len(filtered_products)} products in price range 50-100")
            # Verify all products are within price range
            for product in filtered_products:
                price = product.get('price', 0)
                if not (50 <= price <= 100):
                    print(f"   ❌ Product {product.get('name')} has price {price} outside range")
                    
        # Test search functionality
        success, search_results = self.run_test(
            "Search Products (vitamina)",
            "GET",
            "products?search=vitamina",
            200
        )
        if success:
            print(f"   Found {len(search_results)} products matching 'vitamina'")
            
        # Test combined filters
        success, combined_results = self.run_test(
            "Combined Filter (homeopatia + price 40-60)",
            "GET",
            "products?category=homeopatia&min_price=40&max_price=60",
            200
        )
        if success:
            print(f"   Found {len(combined_results)} homeopatia products in price range 40-60")

    def test_consultation_endpoints(self):
        """Test consultation endpoints"""
        print("\n=== TESTING CONSULTATION ENDPOINTS ===")
        
        # Test creating consultation (public endpoint)
        consultation_data = {
            "name": "Test User",
            "email": "test@medvet.com",
            "phone": "(11) 99999-9999",
            "pet_name": "Rex",
            "pet_type": "cao",
            "pet_age": "5 anos",
            "category": "homeopatia",
            "date": "2025-01-20",
            "time": "10:00",
            "notes": "Test consultation"
        }
        
        success, consultation = self.run_test(
            "Create Consultation",
            "POST",
            "consultations",
            200,
            data=consultation_data
        )
        
        if success:
            print(f"   Consultation created with ID: {consultation.get('id')}")
        
        # Test getting consultations (requires auth)
        self.run_test("Get User Consultations", "GET", "consultations", 200, cookies=self.user_cookies)

    def test_admin_endpoints(self):
        """Test admin-only endpoints"""
        print("\n=== TESTING ADMIN ENDPOINTS ===")
        
        # Re-login as admin since we logged out earlier
        print("   Re-authenticating as admin...")
        success, response = self.run_test(
            "Admin Re-login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@medvet.com", "password": "admin123"}
        )
        if success:
            self.admin_cookies = self.session.cookies
        
        # Test admin stats
        success, stats = self.run_test(
            "Admin Stats",
            "GET",
            "admin/stats",
            200,
            cookies=self.admin_cookies
        )
        if success:
            print(f"   Stats: {stats.get('products', 0)} products, {stats.get('users', 0)} users, {stats.get('consultations', 0)} consultations")
            
        # Test admin get all consultations
        success, admin_consultations = self.run_test(
            "Admin Get All Consultations",
            "GET",
            "admin/consultations",
            200,
            cookies=self.admin_cookies
        )
        if success:
            print(f"   Found {len(admin_consultations)} consultations (admin view)")
            
        # Test admin get all users
        success, admin_users = self.run_test(
            "Admin Get All Users",
            "GET",
            "admin/users",
            200,
            cookies=self.admin_cookies
        )
        if success:
            print(f"   Found {len(admin_users)} users")
            
        # Test admin get all payments
        success, admin_payments = self.run_test(
            "Admin Get All Payments",
            "GET",
            "admin/payments",
            200,
            cookies=self.admin_cookies
        )
        if success:
            print(f"   Found {len(admin_payments)} payment transactions")
            
        # Test admin product CRUD
        self.test_admin_product_crud()
        
        # Test non-admin access (should fail)
        self.run_test(
            "Non-Admin Access to Stats (should fail)",
            "GET",
            "admin/stats",
            403,
            cookies=self.user_cookies
        )

    def test_admin_product_crud(self):
        """Test admin product CRUD operations"""
        print("\n=== TESTING ADMIN PRODUCT CRUD ===")
        
        # Create a test product
        test_product = {
            "name": "Test Product API",
            "description": "This is a test product created via API",
            "price": 99.99,
            "category": "homeopatia",
            "image_url": "https://example.com/test.jpg",
            "in_stock": True,
            "featured": False
        }
        
        success, created_product = self.run_test(
            "Admin Create Product",
            "POST",
            "admin/products",
            200,
            data=test_product,
            cookies=self.admin_cookies
        )
        
        if success and created_product:
            product_id = created_product.get('id')
            print(f"   Created product with ID: {product_id}")
            
            # Update the product
            update_data = {
                "name": "Updated Test Product",
                "price": 149.99,
                "featured": True
            }
            
            success, updated_product = self.run_test(
                "Admin Update Product",
                "PUT",
                f"admin/products/{product_id}",
                200,
                data=update_data,
                cookies=self.admin_cookies
            )
            
            if success:
                print(f"   Updated product: {updated_product.get('name')} - R$ {updated_product.get('price')}")
            
            # Delete the product
            success, _ = self.run_test(
                "Admin Delete Product",
                "DELETE",
                f"admin/products/{product_id}",
                200,
                cookies=self.admin_cookies
            )
            
            if success:
                print(f"   Deleted product with ID: {product_id}")

    def test_contact_endpoint(self):
        """Test contact endpoint"""
        print("\n=== TESTING CONTACT ENDPOINT ===")
        
        contact_data = {
            "name": "Test Contact",
            "email": "contact@test.com",
            "phone": "(11) 99999-9999",
            "message": "This is a test message"
        }
        
        self.run_test(
            "Create Contact",
            "POST",
            "contact",
            200,
            data=contact_data
        )

    def test_stripe_checkout(self):
        """Test Stripe checkout integration"""
        print("\n=== TESTING STRIPE CHECKOUT ===")
        
        # First get a product to test checkout with
        success, products = self.run_test("Get Products for Checkout", "GET", "products", 200)
        
        if success and products:
            test_product = products[0]  # Use first product
            product_id = test_product.get('id')
            
            # Test checkout session creation
            checkout_data = {
                "product_id": product_id,
                "origin_url": "https://holistic-vet-shop.preview.emergentagent.com"
            }
            
            success, checkout_response = self.run_test(
                "Create Checkout Session",
                "POST",
                "checkout",
                200,
                data=checkout_data
            )
            
            if success and checkout_response:
                session_id = checkout_response.get('session_id')
                checkout_url = checkout_response.get('url')
                print(f"   Created checkout session: {session_id}")
                print(f"   Checkout URL: {checkout_url[:50]}...")
                
                # Test checkout status
                if session_id:
                    success, status_response = self.run_test(
                        "Get Checkout Status",
                        "GET",
                        f"checkout/status/{session_id}",
                        200
                    )
                    
                    if success:
                        print(f"   Checkout status: {status_response.get('status')}")
                        print(f"   Payment status: {status_response.get('payment_status')}")
        else:
            print("   ❌ No products available for checkout test")

    def test_pix_payment(self):
        """Test PIX payment integration"""
        print("\n=== TESTING PIX PAYMENT ===")
        
        # First get a product to test PIX with
        success, products = self.run_test("Get Products for PIX", "GET", "products", 200)
        
        if success and products:
            test_product = products[0]  # Use first product
            product_id = test_product.get('id')
            
            # Test PIX checkout creation
            pix_data = {
                "product_id": product_id,
                "name": "Test PIX User",
                "email": "test.pix@medvet.com"
            }
            
            success, pix_response = self.run_test(
                "Create PIX Checkout",
                "POST",
                "checkout/pix",
                200,
                data=pix_data
            )
            
            if success and pix_response:
                tx_id = pix_response.get('tx_id')
                pix_key = pix_response.get('pix_key')
                qr_code = pix_response.get('qr_code')
                print(f"   Created PIX transaction: {tx_id}")
                print(f"   PIX key: {pix_key}")
                print(f"   QR code generated: {'Yes' if qr_code else 'No'}")
                
                # Test admin PIX confirmation
                if tx_id:
                    success, confirm_response = self.run_test(
                        "Admin Confirm PIX Payment",
                        "PUT",
                        f"admin/payments/{tx_id}/confirm",
                        200,
                        cookies=self.admin_cookies
                    )
                    
                    if success:
                        print(f"   PIX payment confirmed successfully")
                        return tx_id
        else:
            print("   ❌ No products available for PIX test")
        return None

    def test_purchase_history(self):
        """Test purchase history endpoint"""
        print("\n=== TESTING PURCHASE HISTORY ===")
        
        # Test getting purchase history (requires user auth)
        success, purchases = self.run_test(
            "Get User Purchase History",
            "GET",
            "purchases",
            200,
            cookies=self.user_cookies
        )
        
        if success:
            print(f"   Found {len(purchases)} purchases in history")
            for purchase in purchases[:3]:  # Show first 3
                print(f"   - {purchase.get('product_name', 'Unknown')} - {purchase.get('payment_method', 'Unknown')} - {purchase.get('payment_status', 'Unknown')}")
        
        # Test unauthorized access
        self.run_test(
            "Unauthorized Purchase History Access",
            "GET",
            "purchases",
            401
        )

    def test_error_cases(self):
        """Test error handling"""
        print("\n=== TESTING ERROR CASES ===")
        
        # Test invalid login
        self.run_test(
            "Invalid Login",
            "POST",
            "auth/login",
            401,
            data={"email": "invalid@test.com", "password": "wrongpass"}
        )
        
        # Test duplicate registration
        self.run_test(
            "Duplicate Registration",
            "POST",
            "auth/register",
            400,
            data={
                "name": "Admin",
                "email": "admin@medvet.com",  # Already exists
                "password": "test123"
            }
        )
        
        # Test non-existent product
        self.run_test("Get Non-existent Product", "GET", "products/nonexistent", 404)
        
        # Test non-existent tip
        self.run_test("Get Non-existent Tip", "GET", "tips/nonexistent", 404)
        
        # Test unauthorized access
        self.run_test("Unauthorized Access to User Data", "GET", "auth/me", 401)

def main():
    print("🚀 Starting MEDVET INTEGRATIVA API Tests")
    print("=" * 50)
    
    tester = MedvetAPITester()
    
    # Run all tests
    if not tester.test_admin_login():
        print("❌ Admin login failed, stopping critical tests")
        return 1
    
    if not tester.test_user_registration_and_login():
        print("❌ User registration failed, continuing with other tests")
    
    tester.test_auth_endpoints()
    tester.test_public_endpoints()
    tester.test_product_filtering_and_search()
    tester.test_consultation_endpoints()
    tester.test_contact_endpoint()
    tester.test_admin_endpoints()
    tester.test_stripe_checkout()
    tester.test_pix_payment()
    tester.test_purchase_history()
    tester.test_error_cases()
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 FINAL RESULTS")
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"Success rate: {success_rate:.1f}%")
    
    if success_rate >= 80:
        print("🎉 Backend API tests mostly successful!")
        return 0
    else:
        print("⚠️  Backend API has significant issues")
        return 1

if __name__ == "__main__":
    sys.exit(main())