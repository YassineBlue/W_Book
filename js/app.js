$(document).ready(function() {
    let allProducts=[];

    //Initialize layout setup state
    updateCartBadge();

    //Fetch books data from source file
    $.getJSON('booksAPI.json', function(data) {
        allProducts=data.map((book, index)=>({
            ...book,
            id: index+1
        }));
        
        populateGenres(allProducts);
        filterAndDisplayProducts();
    }).fail(function() {
        $('#products-container').html('<div class="col-12 text-center py-5"><div class="alert alert-danger d-inline-block">Erreur lors du chargement des livres. Vérifiez votre serveur local et le fichier JSON.</div></div>');
    });

    //drop-down filter selection
    function populateGenres(products) {
        const genres=new Set();
        $.each(products, function(i, item) {
            if(item.genre) genres.add(item.genre.trim());
        });

        genres.forEach(genre=>{
            $('#genre-filter').append(`<option value="${genre}">${genre}</option>`);
        });
    }

    //search and selection logic
    function filterAndDisplayProducts() {
        const searchTerm=$('#search-input').val().toLowerCase();
        const selectedGenre=$('#genre-filter').val();

        const filtered=allProducts.filter(book=>{
            const matchesSearch=book.name.toLowerCase().includes(searchTerm) || book.author.toLowerCase().includes(searchTerm);
            const matchesGenre=selectedGenre==="" || book.genre===selectedGenre;
            return matchesSearch && matchesGenre;
        });

        displayProducts(filtered);
    }

    $('#search-btn').on('click', filterAndDisplayProducts);
    $('#search-input').on('keypress', function(e) {
        if (e.which === 13) {
            filterAndDisplayProducts();
        }
    });
    $('#genre-filter').on('change', filterAndDisplayProducts);
    
    function displayProducts(products) {
        const container=$('#products-container');
        container.empty();

        if (products.length===0) {
            container.html('<div class="col-12 text-center py-5"><i class="fa-solid fa-book-open fs-1 mb-3" style="color: rgba(255,255,255,0.45);"></i><p style="color: rgba(255, 255, 255, 0.55);">Aucun livre ne correspond à vos critères de recherche.</p></div>');
            return;
        }

        let html='';
        $.each(products, function(index, book) {
            html+=`
                <div class="col-sm-6 col-md-4 col-lg-3">
                    <div class="card h-100 border-0 shadow-sm book-card" style="background-color: #1a1a1a; color: white;">
                        <div class="p-3 d-flex justify-content-center border-bottom border-secondary card-img-container" style="overflow: hidden;">
                            <img src="${book.cover}" class="rounded shadow" alt="${book.name}" style="width: 110px; height: 160px; object-fit: cover;">
                        </div>
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title fw-bold text-truncate" title="${book.name}">${book.name}</h5>
                            <p class="card-text small mb-1" style="color: rgba(255, 255, 255, 0.55);">${book.author}</p>
                            <p class="card-text small mb-3"><span class="badge bg-secondary" style="background-color: rgba(255,255,255,0.15) !important; color: #e0e0e0;">${book.genre}</span></p>
                            <div class="mt-auto d-flex justify-content-between align-items-center">
                                <span class="fw-bold fs-5" style="color: var(--primary-color);">${book.price.toFixed(2)} €</span>
                                <button class="btn action-btn p-2 add-to-cart-btn" 
                                    data-id="${book.id}" 
                                    data-name="${book.name.replace(/"/g, '&quot;')}" 
                                    data-price="${book.price}">
                                    <i class="fa-solid fa-cart-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>`;
        });
        container.html(html);
        attachCartEvents();
    }

    //random
    $('#random-book-btn').on('click', function() {
        if(allProducts.length===0) return;
        
        const randomIndex=Math.floor(Math.random() * allProducts.length);
        const selectedBook=allProducts[randomIndex];

        const targetLayoutHtml=`
            <div class="p-3">
                <img src="${selectedBook.cover}" class="rounded shadow mb-3" style="width: 140px; height: 200px; object-fit: cover; border: 1px solid var(--primary-color);">
                <h4 class="fw-bold text-white mb-1">${selectedBook.name}</h4>
                <p class="mb-2" style="color: rgba(255, 255, 255, 0.55);">Par ${selectedBook.author}</p>
                <span class="badge bg-secondary mb-3" style="background-color: rgba(255,255,255,0.15) !important; color: #e0e0e0;">${selectedBook.genre}</span>
                <div class="d-flex justify-content-around align-items-center mt-3 pt-3 border-top border-secondary">
                    <span class="fw-bold fs-4" style="color: var(--primary-color);">${selectedBook.price.toFixed(2)} €</span>
                    <button class="btn action-btn px-4 add-to-cart-btn" 
                        data-id="${selectedBook.id}" 
                        data-name="${selectedBook.name.replace(/"/g, '&quot;')}" 
                        data-price="${selectedBook.price}">
                        <i class="fa-solid fa-cart-plus me-2"></i>Ajouter au Panier
                    </button>
                </div>
            </div>`;
        
        $('#random-modal-body').html(targetLayoutHtml);
        attachCartEvents(); 
        
        const modalObj=new bootstrap.Modal(document.querySelector('#randomBookModal'));
        modalObj.show();
    });

    //Unified procedural attachment lifecycle handler
    function attachCartEvents() {
        $('.add-to-cart-btn').off('click').on('click', function() {
            const btn=$(this);
            const book={
                id: btn.data('id'),
                name: String(btn.data('name')),
                price: parseFloat(btn.data('price')),
                quantity: 1
            };

            let cart=JSON.parse(localStorage.getItem('cart')) || [];
            const existingItem=cart.find(item=>item.id===book.id);

            if (existingItem) {
                existingItem.quantity+=1;
            } else {
                cart.push(book);
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartBadge();

            const originalHtml=btn.html();
            btn.html('<i class="fa-solid fa-check"></i> Prêt !').css({'background-color': '#198754', 'color': 'white'});
            setTimeout(()=>{
                btn.html(originalHtml).css({'background-color': 'var(--primary-color)', 'color': 'var(--bg-color-dark)'});
            }, 1000);
        });
    }
});

function updateCartBadge() {
    const cart=JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems=cart.reduce((sum, item)=>sum+item.quantity, 0);
    const badge=$('#cart-badge');
    
    if (totalItems>0) {
        badge.text(totalItems).show();
    } else {
        badge.hide();
    }
}



//light--dark mode
$(document).ready(function() {
    if (localStorage.getItem('theme') === 'light') {
        $('body').addClass('light-theme');
    }

    $('#btn-light-mode').click(function() {
        $('body').addClass('light-theme');
        localStorage.setItem('theme', 'light');
        $('#themeModal').modal('hide');
    });

    $('#btn-dark-mode').click(function() {
        $('body').removeClass('light-theme');
        localStorage.setItem('theme', 'dark');
        $('#themeModal').modal('hide');
    });
});
