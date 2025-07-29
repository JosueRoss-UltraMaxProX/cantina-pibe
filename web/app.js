// Dados dos produtos
const produtos = [
    { id: 1, name: 'Hambúrguer', price: 15.00, category: 'Lanches', description: 'Hambúrguer artesanal' },
    { id: 2, name: 'X-Burger', price: 18.00, category: 'Lanches', description: 'Com queijo e salada' },
    { id: 3, name: 'X-Bacon', price: 22.00, category: 'Lanches', description: 'Com bacon crocante' },
    { id: 4, name: 'X-Tudo', price: 25.00, category: 'Lanches', description: 'Completo com tudo' },
    { id: 5, name: 'Coca-Cola', price: 5.00, category: 'Bebidas', description: 'Lata 350ml' },
    { id: 6, name: 'Guaraná', price: 5.00, category: 'Bebidas', description: 'Lata 350ml' },
    { id: 7, name: 'Água', price: 3.00, category: 'Bebidas', description: 'Garrafa 500ml' },
    { id: 8, name: 'Suco Natural', price: 8.00, category: 'Bebidas', description: 'Laranja ou Limão' },
    { id: 9, name: 'Brigadeiro', price: 2.50, category: 'Doces', description: 'Unidade' },
    { id: 10, name: 'Beijinho', price: 2.50, category: 'Doces', description: 'Unidade' },
    { id: 11, name: 'Pudim', price: 6.00, category: 'Doces', description: 'Fatia' },
    { id: 12, name: 'Coxinha', price: 6.00, category: 'Salgados', description: 'Coxinha de frango' },
    { id: 13, name: 'Pastel', price: 7.00, category: 'Salgados', description: 'Queijo ou carne' },
    { id: 14, name: 'Empada', price: 5.00, category: 'Salgados', description: 'Frango ou palmito' },
    { id: 15, name: 'Kibe', price: 6.00, category: 'Salgados', description: 'Kibe frito' }
];

let carrinho = [];
let categoriaAtual = 'todos';

// Inicializar app
document.addEventListener('DOMContentLoaded', function() {
    renderizarProdutos();
    configurarEventos();
});

function configurarEventos() {
    // Eventos das categorias
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelector('.category-btn.active').classList.remove('active');
            this.classList.add('active');
            categoriaAtual = this.dataset.category;
            renderizarProdutos();
        });
    });

    // Evento do carrinho
    document.querySelector('.cart-info').addEventListener('click', abrirCarrinho);

    // Evento do modal
    document.querySelector('.close').addEventListener('click', fecharCarrinho);
    window.addEventListener('click', function(event) {
        if (event.target.className === 'modal') {
            fecharCarrinho();
        }
    });
}

function renderizarProdutos() {
    const grid = document.getElementById('products-grid');
    const produtosFiltrados = categoriaAtual === 'todos' 
        ? produtos 
        : produtos.filter(p => p.category === categoriaAtual);
    
    grid.innerHTML = produtosFiltrados.map(produto => `
        <div class="product-card">
            <div class="product-image"></div>
            <h3 class="product-name">${produto.name}</h3>
            <p class="product-description">${produto.description}</p>
            <p class="product-price">R$ ${produto.price.toFixed(2)}</p>
            <button class="add-btn" onclick="adicionarAoCarrinho(${produto.id})">Adicionar</button>
        </div>
    `).join('');
}

function adicionarAoCarrinho(produtoId) {
    const produto = produtos.find(p => p.id === produtoId);
    const itemExistente = carrinho.find(item => item.id === produtoId);
    
    if (itemExistente) {
        itemExistente.quantidade++;
    } else {
        carrinho.push({
            ...produto,
            quantidade: 1
        });
    }
    
    atualizarCarrinho();
    
    // Feedback visual
    event.target.style.background = '#2d9b94';
    setTimeout(() => {
        event.target.style.background = '#4ECDC4';
    }, 200);
}

function atualizarCarrinho() {
    const quantidade = carrinho.reduce((total, item) => total + item.quantidade, 0);
    const total = carrinho.reduce((total, item) => total + (item.price * item.quantidade), 0);
    
    document.getElementById('cart-count').textContent = `Carrinho (${quantidade})`;
    document.getElementById('cart-total').textContent = `R$ ${total.toFixed(2)}`;
}

function abrirCarrinho() {
    const modal = document.getElementById('cart-modal');
    const cartItems = document.getElementById('cart-items');
    const total = carrinho.reduce((total, item) => total + (item.price * item.quantidade), 0);
    
    if (carrinho.length === 0) {
        cartItems.innerHTML = '<p>Carrinho vazio</p>';
    } else {
        cartItems.innerHTML = carrinho.map(item => `
            <div class="cart-item">
                <div>
                    <h4>${item.name}</h4>
                    <p>R$ ${item.price.toFixed(2)}</p>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="alterarQuantidade(${item.id}, -1)">-</button>
                    <span>${item.quantidade}</span>
                    <button class="quantity-btn" onclick="alterarQuantidade(${item.id}, 1)">+</button>
                </div>
            </div>
        `).join('');
    }
    
    document.getElementById('modal-total').textContent = `R$ ${total.toFixed(2)}`;
    modal.style.display = 'block';
}

function fecharCarrinho() {
    document.getElementById('cart-modal').style.display = 'none';
}

function alterarQuantidade(produtoId, delta) {
    const item = carrinho.find(item => item.id === produtoId);
    
    if (item) {
        item.quantidade += delta;
        
        if (item.quantidade <= 0) {
            carrinho = carrinho.filter(i => i.id !== produtoId);
        }
        
        atualizarCarrinho();
        abrirCarrinho(); // Reabrir para atualizar a visualização
    }
}

function finalizarPedido() {
    if (carrinho.length === 0) {
        alert('Carrinho vazio!');
        return;
    }
    
    const total = carrinho.reduce((total, item) => total + (item.price * item.quantidade), 0);
    const itens = carrinho.map(item => `${item.quantidade}x ${item.name}`).join('\n');
    
    alert(`Pedido finalizado!\n\n${itens}\n\nTotal: R$ ${total.toFixed(2)}`);
    
    // Limpar carrinho
    carrinho = [];
    atualizarCarrinho();
    fecharCarrinho();
}

// Prevenir zoom no iOS
document.addEventListener('gesturestart', function(e) {
    e.preventDefault();
});

// Otimizar toque
document.addEventListener('touchstart', function() {}, {passive: true});