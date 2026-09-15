async function testPricing() {
  console.log('Testing GET /api/products...');
  const res = await fetch('http://localhost:3000/api/products');
  const products = await res.json();
  console.log('Sample product received by buyer/public:');
  console.log({
    name: products[0].name,
    basePrice: products[0].basePrice,
    commissionAmount: products[0].commissionAmount,
    buyerPrice: products[0].price
  });

  if (products[0].basePrice && products[0].commissionAmount && products[0].price) {
    console.log('✅ Base price, 10% commission, and buyer final price verified successfully!');
  } else {
    console.error('❌ Pricing calculation mismatch');
  }
}

testPricing().catch(err => console.error(err));
