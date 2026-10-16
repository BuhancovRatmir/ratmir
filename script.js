'use strict';
// Учебные товары. SELECT/BASE — ценовые категории, а не подтверждение подлинности бренда.
const PRODUCTS = [
  {id:'tee-black',name:'Футболка Heavy',category:'tees',audience:'men',segment:'select',price:3290,color:'чёрный',detail:'Плотная футболка свободного силуэта',sizes:['S','M','L','XL'],image:'tee-black.jpg'},
  {id:'tee-white',name:'Футболка Everyday',category:'tees',audience:'women',segment:'base',price:1490,color:'белый',detail:'Базовая футболка прямого кроя',sizes:['XS','S','M','L'],image:'tee-white.jpg'},
  {id:'hoodie-charcoal',name:'Худи Studio',category:'hoodies',audience:'unisex',segment:'select',price:6490,color:'графит',detail:'Свободное худи с карманом-кенгуру',sizes:['S','M','L','XL'],image:'hoodie-charcoal.jpg'},
  {id:'hoodie-grey',name:'Худи Zip',category:'hoodies',audience:'women',segment:'base',price:3190,color:'серый меланж',detail:'Худи на молнии с капюшоном',sizes:['XS','S','M','L'],image:'hoodie-grey.jpg'},
  {id:'jacket-bomber',name:'Куртка Flight',category:'jackets',audience:'men',segment:'select',price:10990,color:'чёрный',detail:'Объёмный бомбер с воротником-стойкой',sizes:['S','M','L','XL'],image:'jacket-bomber.jpg'},
  {id:'jacket-trench',name:'Куртка City Trench',category:'jackets',audience:'women',segment:'base',price:7890,color:'бежевый',detail:'Укороченная куртка в стиле тренча',sizes:['XS','S','M','L'],image:'jacket-trench.jpg'},
  {id:'pants-black',name:'Брюки Wide',category:'pants',audience:'unisex',segment:'select',price:5290,color:'чёрный',detail:'Широкие брюки с мягкой посадкой',sizes:['S','M','L','XL'],image:'pants-black.jpg'},
  {id:'pants-beige',name:'Брюки Straight',category:'pants',audience:'men',segment:'base',price:2890,color:'песочный',detail:'Прямые хлопковые брюки',sizes:['S','M','L','XL'],image:'pants-beige.jpg'},
  {id:'sneaker-white',name:'Кроссовки Form 01',category:'shoes',audience:'unisex',segment:'select',price:9490,color:'молочный',detail:'Объёмные кроссовки на рельефной подошве',sizes:['38','39','40','41','42','43'],image:'sneaker-white.jpg'},
  {id:'sneaker-black',name:'Кроссовки Move',category:'shoes',audience:'unisex',segment:'base',price:4890,color:'чёрный',detail:'Повседневные кроссовки в тёмной гамме',sizes:['38','39','40','41','42','43'],image:'sneaker-black.jpg'},
  {id:'bag-black',name:'Сумка Utility',category:'accessories',audience:'unisex',segment:'select',price:3990,color:'чёрный',detail:'Сумка через плечо с двумя застёжками',sizes:['ONE SIZE'],image:'bag-black.jpg'},
  {id:'cap-brown',name:'Кепка Washed',category:'accessories',audience:'unisex',segment:'base',price:1790,color:'коричневый',detail:'Кепка из ткани с эффектом стирки',sizes:['ONE SIZE'],image:'cap-brown.jpg'}
];
const CATEGORIES = {tees:'Футболки',hoodies:'Худи',jackets:'Куртки',pants:'Брюки',shoes:'Обувь',accessories:'Аксессуары'};
const AUDIENCES = {men:'Мужское',women:'Женское',unisex:'Унисекс'};
const formatPrice = value => new Intl.NumberFormat('ru-RU').format(value)+' сом';
const img = product => 'assets/images/'+product.image;
const byId = id => PRODUCTS.find(p=>p.id===id);
const safeCart = () => {try {const data=JSON.parse(localStorage.getItem('district-cart-v1')||'[]'); return Array.isArray(data)?data.filter(item=>byId(item.id)&&Number.isInteger(item.qty)&&item.qty>0&&item.qty<100):[];} catch {return []}};
let cart=safeCart();let compare=[];let toastTimer=0;let overlayReturnFocus=null;
const page=document.body.dataset.page;
const uiMount=document.getElementById('uiMount');
function saveCart(){try{localStorage.setItem('district-cart-v1',JSON.stringify(cart))}catch{} updateCount()}
function updateCount(){document.querySelectorAll('[data-cart-count]').forEach(el=>el.textContent=cart.reduce((sum,item)=>sum+item.qty,0))}
function addToCart(id,size){const p=byId(id);if(!p)return;size=size||p.sizes[Math.min(1,p.sizes.length-1)];const found=cart.find(item=>item.id===id&&item.size===size);if(found)found.qty=Math.min(99,found.qty+1);else cart.push({id,size,qty:1});saveCart();toast('Добавлено в корзину: '+p.name)}
function toast(message){let el=document.getElementById('siteToast');if(!el){el=document.createElement('div');el.id='siteToast';el.className='toast';el.setAttribute('role','status');document.body.append(el)}el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,2800)}
function productCard(p){return `<article class="product-card"><button type="button" class="product-image" data-detail="${p.id}" aria-label="Подробнее: ${p.name}"><span class="product-badge ${p.segment}">${p.segment.toUpperCase()}</span><img src="${img(p)}" alt="${p.detail}, цвет ${p.color}" loading="lazy"><span class="quick-view">Подробнее о вещи ↗</span></button><div class="product-desc"><div class="product-line"><h3>${p.name}</h3><strong class="product-price">${formatPrice(p.price)}</strong></div><p class="product-details">${CATEGORIES[p.category]} · ${p.color}</p><div class="card-actions"><button class="cart-add" type="button" data-add="${p.id}">В корзину +</button><button class="compare-add" type="button" data-compare="${p.id}" aria-pressed="${compare.includes(p.id)}">${compare.includes(p.id)?'Убрать −':'Сравнить +'}</button></div></div></article>`}
function renderFeatured(){const dest=document.getElementById('featuredProducts');if(!dest)return;dest.innerHTML=['jacket-bomber','hoodie-grey','sneaker-white','bag-black'].map(byId).map(productCard).join('')}
const state={category:'all',audience:'all',segment:'all',maxPrice:12000,sort:'default'};
function syncFilters(){const q=new URLSearchParams(location.search);if(CATEGORIES[q.get('category')])state.category=q.get('category');if(AUDIENCES[q.get('audience')])state.audience=q.get('audience');document.getElementById('categoryFilter').value=state.category;document.getElementById('audienceFilter').value=state.audience;document.getElementById('priceRange').value=state.maxPrice;setSegmentButtons()}
function setSegmentButtons(){document.querySelectorAll('[data-segment]').forEach(el=>el.classList.toggle('active',el.dataset.segment===state.segment))}
function renderCatalog(){const dest=document.getElementById('catalogProducts');if(!dest)return;let items=PRODUCTS.filter(p=>(state.category==='all'||p.category===state.category)&&(state.audience==='all'||p.audience===state.audience||p.audience==='unisex')&&(state.segment==='all'||p.segment===state.segment)&&p.price<=state.maxPrice);
if(state.sort==='cheap')items.sort((a,b)=>a.price-b.price);if(state.sort==='expensive')items.sort((a,b)=>b.price-a.price);if(state.sort==='name')items.sort((a,b)=>a.name.localeCompare(b.name,'ru'));
dest.innerHTML=items.map(productCard).join('');document.getElementById('resultCount').textContent=items.length+' '+(items.length===1?'вещь':items.length>=2&&items.length<=4?'вещи':'вещей');document.getElementById('priceValue').textContent=formatPrice(state.maxPrice);document.getElementById('emptyState').hidden=items.length>0;updateCompareBar()}
function resetFilters(){Object.assign(state,{category:'all',audience:'all',segment:'all',maxPrice:12000,sort:'default'});document.getElementById('categoryFilter').value='all';document.getElementById('audienceFilter').value='all';document.getElementById('priceRange').value=12000;document.getElementById('sortSelect').value='default';setSegmentButtons();renderCatalog()}
function setupCatalog(){if(page!=='catalog')return;syncFilters();renderCatalog();document.getElementById('categoryFilter').addEventListener('change',e=>{state.category=e.target.value;renderCatalog()});document.getElementById('audienceFilter').addEventListener('change',e=>{state.audience=e.target.value;renderCatalog()});document.getElementById('priceRange').addEventListener('input',e=>{state.maxPrice=Number(e.target.value);renderCatalog()});document.getElementById('sortSelect').addEventListener('change',e=>{state.sort=e.target.value;renderCatalog()});document.getElementById('resetFilters').addEventListener('click',resetFilters);document.getElementById('emptyReset').addEventListener('click',resetFilters);document.getElementById('mobileFilters').addEventListener('click',e=>{const open=document.getElementById('filterPanel').classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',String(open))});document.querySelectorAll('[data-segment]').forEach(el=>el.addEventListener('click',()=>{state.segment=el.dataset.segment;setSegmentButtons();renderCatalog()}))}
function makeOverlay(content,{kind='panel',title=''}={}){closeOverlay();overlayReturnFocus=document.activeElement;document.body.classList.add('locked');uiMount.innerHTML=`<div class="ui-overlay" data-close-ui></div>${kind==='panel'?`<aside class="ui-panel" role="dialog" aria-modal="true" aria-label="${title}">${content}</aside>`:`${content}`}`;const close=uiMount.querySelector('.close-ui');if(close)close.focus()}
function closeOverlay(){uiMount.innerHTML='';document.body.classList.remove('locked');overlayReturnFocus?.focus?.();overlayReturnFocus=null}
function showProduct(id){const p=byId(id);if(!p)return;const content=`<div class="product-modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><div class="modal-photo"><img src="${img(p)}" alt="${p.detail}"></div><div class="modal-body"><button class="close-ui modal-close" type="button" data-close-ui aria-label="Закрыть">×</button><span class="modal-tag">${p.segment.toUpperCase()} / ${CATEGORIES[p.category]}</span><h2 id="modalTitle">${p.name}</h2><strong class="modal-price">${formatPrice(p.price)}</strong><p class="modal-desc">${p.detail}. Цвет: ${p.color}. Стиль: ${AUDIENCES[p.audience].toLowerCase()}.</p><p class="modal-meta">Размеры и состав приведены для учебного примера. Фотография демонстрационная, изделие не предлагается к реальной продаже.</p><label for="modalSize">Выберите размер</label><select id="modalSize">${p.sizes.map(s=>`<option value="${s}">${s}</option>`).join('')}</select><button type="button" class="button button-dark wide-button" data-modal-add="${p.id}">Добавить в корзину +</button></div></div>`;makeOverlay(content,{kind:'modal'})}
function cartRow(item){const p=byId(item.id);if(!p)return '';return `<article class="cart-row"><img src="${img(p)}" alt="${p.name}"><div class="cart-row-info"><h3>${p.name}</h3><p>Размер ${item.size} · ${formatPrice(p.price)}</p><div class="cart-row-bottom"><div class="qty-control"><button data-qty="-1" data-id="${p.id}" data-size="${item.size}" aria-label="Уменьшить количество">−</button><span>${item.qty}</span><button data-qty="1" data-id="${p.id}" data-size="${item.size}" aria-label="Увеличить количество">+</button></div><strong>${formatPrice(p.price*item.qty)}</strong></div><button class="remove-item" type="button" data-remove="${p.id}" data-size="${item.size}">Удалить</button></div></article>`}
function showCart(){const total=cart.reduce((sum,item)=>sum+byId(item.id).price*item.qty,0);const content=`<div class="panel-header"><h2>Корзина <small>(${cart.reduce((s,item)=>s+item.qty,0)})</small></h2><button class="close-ui" type="button" data-close-ui aria-label="Закрыть корзину">×</button></div><div class="panel-content">${cart.length?`${cart.map(cartRow).join('')}<div class="cart-summary"><span>Итого</span><span>${formatPrice(total)}</span></div><p class="cart-disclaimer">Это учебная корзина. Онлайн-оплаты и доставки нет. Список товаров можно скопировать.</p><button type="button" class="button button-dark wide-button" data-copy-cart>Скопировать список заказа</button>`:`<div class="cart-empty"><strong>Здесь пока пусто.</strong><p>Выберите вещи в каталоге и вернитесь сюда.</p><button class="button button-dark" data-go-catalog>Открыть каталог ↗</button></div>`}</div>`;makeOverlay(content,{title:'Корзина'})}
function changeQuantity(id,size,diff){const item=cart.find(p=>p.id===id&&p.size===size);if(!item)return;item.qty+=diff;if(item.qty<1)cart=cart.filter(p=>p!==item);if(item.qty>99)item.qty=99;saveCart();showCart()}
function toggleCompare(id){if(compare.includes(id))compare=compare.filter(p=>p!==id);else if(compare.length<2)compare.push(id);else{toast('Можно сравнить только две вещи');return}document.querySelectorAll('[data-compare]').forEach(el=>{const selected=compare.includes(el.dataset.compare);el.setAttribute('aria-pressed',String(selected));el.textContent=selected?'Убрать −':'Сравнить +'});updateCompareBar()}
function updateCompareBar(){document.querySelector('.compare-bar')?.remove();if(!compare.length)return;const bar=document.createElement('div');bar.className='compare-bar';bar.innerHTML=`<span>Для сравнения: ${compare.length} / 2</span><button type="button" data-open-compare ${compare.length<2?'disabled':''}>Сравнить вещи ↗</button><button class="compare-clear" type="button" data-clear-compare>Очистить</button>`;document.body.append(bar)}
function showCompare(){if(compare.length!==2)return;const a=byId(compare[0]),b=byId(compare[1]);const difference=Math.abs(a.price-b.price);const content=`<div class="panel-header"><h2>Сравнение</h2><button class="close-ui" type="button" data-close-ui aria-label="Закрыть сравнение">×</button></div><div class="panel-content"><div class="compare-content">${[a,b].map(p=>`<div><img src="${img(p)}" alt="${p.name}"><h3>${p.name}</h3><p>${p.segment.toUpperCase()} · ${CATEGORIES[p.category]}</p><strong>${formatPrice(p.price)}</strong></div>`).join('')}</div><p class="compare-result">Разница в цене — <strong>${formatPrice(difference)}</strong>. Это сравнение ценовых сегментов в демонстрационном каталоге, а не сравнение подлинности или качества брендов.</p></div>`;makeOverlay(content,{title:'Сравнение вещей'})}
function copyCart(){const lines=['DISTRICT — учебный список товаров',...cart.map(item=>{const p=byId(item.id);return `${p.name} / ${item.size} / ${item.qty} шт. / ${formatPrice(p.price*item.qty)}`}),`ИТОГО: ${formatPrice(cart.reduce((s,item)=>s+byId(item.id).price*item.qty,0))}`,'Учебный проект, оплата и доставка отсутствуют.'];const text=lines.join('\n');if(navigator.clipboard?.writeText){navigator.clipboard.writeText(text).then(()=>toast('Список скопирован')).catch(()=>fallbackCopy(text))}else fallbackCopy(text)}
function fallbackCopy(text){const area=document.createElement('textarea');area.value=text;document.body.append(area);area.select();const ok=document.execCommand('copy');area.remove();toast(ok?'Список скопирован':'Не удалось скопировать список')}
function bindEvents() {
  document.addEventListener('click', e => {
    const target=e.target.closest('button,[data-close-ui]');
    if(!target) return;
    if(target.hasAttribute('data-close-ui')) {closeOverlay();return;}
    if(target.dataset.action==='menu') {
      const open=document.body.classList.toggle('mobile-nav-open');
      target.setAttribute('aria-expanded',String(open));
      target.textContent=open?'×':'☰';return;
    }
    if(target.dataset.action==='cart'){showCart();return;}
    if(target.dataset.detail){showProduct(target.dataset.detail);return;}
    if(target.dataset.add){addToCart(target.dataset.add);return;}
    if(target.dataset.modalAdd){addToCart(target.dataset.modalAdd,document.getElementById('modalSize').value);closeOverlay();return;}
    if(target.dataset.compare){toggleCompare(target.dataset.compare);return;}
    if(target.dataset.qty){changeQuantity(target.dataset.id,target.dataset.size,Number(target.dataset.qty));return;}
    if(target.dataset.remove){cart=cart.filter(p=>!(p.id===target.dataset.remove&&p.size===target.dataset.size));saveCart();showCart();return;}
    if(target.hasAttribute('data-copy-cart')){copyCart();return;}
    if(target.hasAttribute('data-go-catalog')){location.href='catalog.html';return;}
    if(target.hasAttribute('data-open-compare')){showCompare();return;}
    if(target.hasAttribute('data-clear-compare')){
      compare=[];
      document.querySelectorAll('[data-compare]').forEach(el=>{el.setAttribute('aria-pressed','false');el.textContent='Сравнить +';});
      updateCompareBar();return;
    }
  });
  document.addEventListener('keydown', e=>{
    if(e.key!=='Escape')return;
    if(uiMount.children.length){closeOverlay();return;}
    if(document.body.classList.contains('mobile-nav-open')){
      document.body.classList.remove('mobile-nav-open');
      const button=document.querySelector('.mobile-menu-button');
      button.setAttribute('aria-expanded','false');button.textContent='☰';
    }
  });
}

updateCount();renderFeatured();setupCatalog();bindEvents();
