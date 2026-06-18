$(document).ready(function() {
    updateCartBadge();
    renderCart();

    //clear cart
    $('#clear-cart-btn').on('click',function() {
        if(confirm("Êtes-vous sûr de vouloir vider votre panier ?")) {
            localStorage.removeItem('cart');
            updateCartBadge();
            renderCart();
        }
    });

   
    function renderCart() {
        const cart=JSON.parse(localStorage.getItem('cart')) || [];
        const container=$('#cart-container');
        let total=0;

        container.empty();

        if (cart.length===0) {
            container.html(`
                <tr>
                    <td colspan="4" class="text-center py-5 cart-empty-msg" style="color: rgba(255,255,255,0.45);">
                        <i class="fa-solid fa-cart-arrow-down fs-1 mb-3"></i>
                        <p>Votre panier est vide.</p>
                    </td>
                </tr>
            `);
            $('#cart-total').text('0.00 DHS');
            return;
        }

        $.each(cart,function(index,item) {
            const itemTotal=item.price*item.quantity;
            total+=itemTotal;

            container.append(`
                <tr>
                    <td class="fw-bold text-start ps-4">${item.name}</td>
                    <td>${item.price.toFixed(2)} DHS</td>
                    <td><span class="badge bg-secondary px-3 py-2 fs-6">${item.quantity}</span></td>
                    <td class="fw-bold">${itemTotal.toFixed(2)} DHS</td>
                </tr>
            `);
        });

        $('#cart-total').text(total.toFixed(2)+' DHS');
    }
});


function updateCartBadge() {
    const cart=JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems=cart.reduce((sum,item)=>sum+item.quantity,0);
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