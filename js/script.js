// Mock Products Data (Simulating Netlify CMS JSON Output)
const productsData = [
  {
    id: "p1",
    slug: "classic-dusty-rose-perfume",
    title: "عطر الجوري المخملي",
    price: 350,
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=60",
    short_description: "عطر نسائي أنيق برائحة الورد المغبر والميل الخفيف للأخشاب.",
    body: "استمتعي بجاذبية لا تقاوم مع عطر الجوري المخملي. تركيبة فريدة تجمع بين نعومة الورد الصافي وعمق الأخشاب العطرية ليمنحكِ إطلالة ملكية تدوم طوال اليوم. مناسب للمناسبات الخاصة والاستخدام اليومي."
  },
  {
    id: "p2",
    slug: "silk-matte-lipstick",
    title: "أحمر شفاه حريري مطفي",
    price: 120,
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=60",
    short_description: "أحمر شفاه بدرجة الوردي المغبر مع ترطيب عالي.",
    body: "أحمر شفاه كريمي مطفي مميز بدرجة الوردي المغبر (Dusty Rose). يحتوي على زبدة الشيا وفيتامين E لترطيب شفتيك طوال اليوم دون أن يسبب جفاف أو تشقق."
  },
  {
    id: "p3",
    slug: "luxury-skincare-set",
    title: "مجموعة العناية الفاخرة",
    price: 550,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=60",
    short_description: "مجموعة متكاملة للعناية بالبشرة وتنظيفها.",
    body: "مكونة من غسول منظف للوجه، تونر منعش، وسيروم فيتامين سي لتوحيد لون البشرة. صممت هذه المجموعة بعناية فائقة لتجديد خلايا البشرة وإعطائها نضارة وحيوية لا مثيل لها."
  },
  {
    id: "p4",
    slug: "organic-face-oil",
    title: "زيت الإشراقة الطبيعي",
    price: 180,
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop&q=60",
    short_description: "زيت عضوي لترطيب ونضارة الوجه.",
    body: "مستخلص من بذور الورد والأرغان الطبيعي 100%. يعمل كمرطب ليلي مثالي ليترك بشرتك ناعمة كالحرير في الصباح. خفيف الوزن وسريع الامتصاص."
  }
];

// Helper functions for formatting
const formatPrice = (price) => `${price} ريال`;

// --- HOME PAGE LOGIC ---
const initHomePage = () => {
  const productGrid = document.getElementById("product-grid");
  const searchInput = document.getElementById("search-input");

  if (!productGrid) return; // Not on the home page

  // Render products
  const renderProducts = (products) => {
    productGrid.innerHTML = "";

    if (products.length === 0) {
      productGrid.innerHTML = `<div class="no-results">لم يتم العثور على منتجات مطابقة للبحث.</div>`;
      return;
    }

    products.forEach(product => {
      const card = document.createElement("a");
      card.href = `product-detail.html?slug=${product.slug}`;
      card.className = "product-card";

      card.innerHTML = `
        <img src="${product.image}" alt="${product.title}" class="product-img">
        <div class="product-info">
          <h3 class="product-title">${product.title}</h3>
          <p class="product-desc">${product.short_description}</p>
          <div class="product-bottom">
            <span class="product-price">${formatPrice(product.price)}</span>
            <span class="btn btn-outline">تفاصيل</span>
          </div>
        </div>
      `;

      productGrid.appendChild(card);
    });
  };

  // Initial render
  renderProducts(productsData);

  // Search Logic (Real-time filtering)
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase().trim();
      const filtered = productsData.filter(product =>
        product.title.toLowerCase().includes(term) ||
        product.short_description.toLowerCase().includes(term)
      );
      renderProducts(filtered);
    });
  }
};

// --- PRODUCT DETAIL PAGE LOGIC ---
const initProductPage = () => {
  const container = document.getElementById("product-detail-view");
  if (!container) return; // Not on product page

  // Get slug from URL query
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  const product = productsData.find(p => p.slug === slug);

  if (!product) {
    container.innerHTML = `<div class="no-results">المنتج غير موجود.<br><br><a href="index.html" class="btn btn-primary">العودة للرئيسية</a></div>`;
    return;
  }

  // Construct WhatsApp Message
  const currentUrl = window.location.href;
  const whatsappMsg = `أهلاً متجر الأناقة، أريد طلب منتج: ${product.title} - الرابط: ${currentUrl}`;
  const whatsappUrl = `https://wa.me/967772872245?text=${encodeURIComponent(whatsappMsg)}`; // Replace with real number later

  // Render detail view
  container.innerHTML = `
    <div class="detail-img-wrap">
      <img src="${product.image}" alt="${product.title}">
    </div>
    <div class="detail-info">
      <h1 class="detail-title">${product.title}</h1>
      <div class="detail-price">${formatPrice(product.price)}</div>
      <div class="detail-body">${product.body.replace(/\n/g, '<br>')}</div>
      <a href="${whatsappUrl}" target="_blank" class="btn btn-whatsapp">
        <i class="fab fa-whatsapp"></i> اطلب الآن عبر واتساب
      </a>
    </div>
  `;
};

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initHomePage();
  initProductPage();
});
