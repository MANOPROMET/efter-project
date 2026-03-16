// Helper functions for formatting
const formatPrice = (price) => `${price} ريال`;

// Global products array to hold data fetched from Markdown
let productsData = [];

// Fallback Mock Data in case GitHub fetch fails or running locally without API access
const fallbackProducts = [
  {
    slug: "classic-dusty-rose-perfume",
    title: "عطر الجوري المخملي",
    price: 350,
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=60",
    short_description: "عطر نسائي أنيق برائحة الورد المغبر والميل الخفيف للأخشاب.",
    body: "استمتعي بجاذبية لا تقاوم مع عطر الجوري المخملي. تركيبة فريدة تجمع بين نعومة الورد الصافي وعمق الأخشاب العطرية ليمنحكِ إطلالة ملكية تدوم طوال اليوم."
  },
  {
    slug: "silk-matte-lipstick",
    title: "أحمر شفاه حريري مطفي",
    price: 120,
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=60",
    short_description: "أحمر شفاه بدرجة الوردي المغبر مع ترطيب عالي.",
    body: "أحمر شفاه كريمي مطفي مميز بدرجة الوردي المغبر. يحتوي على زبدة الشيا لترطيب شفتيك."
  }
];

// --- GITHUB API FETCHING LOGIC ---
const GITHUB_REPO = "MANOPROMET/efter-project"; // User's repository
const BRANCH = "main";
const PRODUCTS_FOLDER = "content/products";

// Parse Frontmatter from Markdown string
const parseMarkdown = (mdString, filename) => {
  const normalizedString = mdString.replace(/\r\n/g, '\n');
  
  // 1. Try JSON Frontmatter Format (Decap CMS default for 'json-frontmatter')
  const jsonMatch = /^\s*({[\s\S]*?})\n([\s\S]*)/.exec(normalizedString);
  if (jsonMatch) {
    try {
      const jsonData = JSON.parse(jsonMatch[1]);
      return {
        slug: filename.replace('.md', ''),
        title: jsonData.title || "",
        price: Number(jsonData.price) || 0,
        image: jsonData.image || "",
        short_description: jsonData.short_description || "",
        body: jsonMatch[2].trim()
      };
    } catch (e) {
      console.warn("Error parsing JSON frontmatter for", filename, e);
    }
  }

  // 2. Try Standard YAML format `--- ... ---`
  const yamlMatch = /^---\n([\s\S]*?)\n---\n([\s\S]*)/.exec(normalizedString);
  if (yamlMatch) {
    const yamlString = yamlMatch[1];
    const markdownBody = yamlMatch[2];
    
    const parseField = (field, str) => {
      const regex = new RegExp(`^${field}:\\s*(?:"([^"]*)"|'([^']*)'|(.*))$`, 'im');
      const res = regex.exec(str);
      if (res) {
        return (res[1] !== undefined ? res[1] : (res[2] !== undefined ? res[2] : res[3])).trim();
      }
      return "";
    };

    return {
      slug: filename.replace('.md', ''),
      title: parseField('title', yamlString),
      price: Number(parseField('price', yamlString)) || 0,
      image: parseField('image', yamlString),
      short_description: parseField('short_description', yamlString),
      body: markdownBody.trim()
    };
  }
  
  console.warn("Failed to parse markdown for", filename);
  return null;
};

const fetchProducts = async () => {
  try {
    // 1. Get list of files in the directory
    // Note: To avoid rate limits, a production app should use a build step (Next.js/Gatsby/Jekyll) 
    // instead of fetching raw MD from GitHub on every client load. Since this is pure HTML/JS, 
    // we use the public GitHub API as a workaround for the user.
    const apiURL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${PRODUCTS_FOLDER}?ref=${BRANCH}`;
    const response = await fetch(apiURL);
    
    if (!response.ok) {
        throw new Error("GitHub API failed or rate limited");
    }

    const files = await response.json();
    const mdFiles = files.filter(f => f.name.endsWith('.md'));

    // 2. Fetch content of each Markdown file
    const productPromises = mdFiles.map(async file => {
      const rawRes = await fetch(file.download_url);
      const rawText = await rawRes.text();
      return parseMarkdown(rawText, file.name);
    });

    const parsedProducts = await Promise.all(productPromises);
    productsData = parsedProducts.filter(p => p !== null);

  } catch (error) {
    console.warn("Could not fetch remote products. Falling back to mock data.", error);
    productsData = fallbackProducts;
  }
};

// --- HOME PAGE LOGIC ---
const renderProducts = (products) => {
    const productGrid = document.getElementById("product-grid");
    if(!productGrid) return;

    productGrid.innerHTML = "";
    
    if (products.length === 0) {
      productGrid.innerHTML = `<div class="no-results">لم يتم العثور على منتجات مطابقة لعملية البحث.</div>`;
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

const initHomePage = () => {
  const searchInput = document.getElementById("search-input");
  
  if (!document.getElementById("product-grid")) return; 

  // Initial render
  renderProducts(productsData);

  // Search Logic (Real-time filtering)
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase().trim();
      const filtered = productsData.filter(product => 
        (product.title && product.title.toLowerCase().includes(term)) || 
        (product.short_description && product.short_description.toLowerCase().includes(term))
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

  const currentUrl = window.location.href;
  const whatsappMsg = `أهلاً متجر الأناقة، أريد طلب منتج: ${product.title} - الرابط: ${currentUrl}`;
  const whatsappUrl = `https://wa.me/967772872245?text=${encodeURIComponent(whatsappMsg)}`;

  // Convert markdown body to basic HTML (newline replacement since we don't have a full marked library imported via cdn)
  const formattedBody = product.body ? product.body.replace(/\n/g, '<br>') : "";

  container.innerHTML = `
    <div class="detail-img-wrap">
      <img src="${product.image}" alt="${product.title}">
    </div>
    <div class="detail-info">
      <h1 class="detail-title">${product.title}</h1>
      <div class="detail-price">${formatPrice(product.price)}</div>
      <div class="detail-body">${formattedBody}</div>
      <a href="${whatsappUrl}" target="_blank" class="btn btn-whatsapp">
        <i class="fab fa-whatsapp"></i> اطلب الآن عبر واتساب
      </a>
    </div>
  `;
};

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  // Wait to fetch data before initializing views
  await fetchProducts();
  initHomePage();
  initProductPage();
});
