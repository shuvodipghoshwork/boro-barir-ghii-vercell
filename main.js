document.addEventListener("DOMContentLoaded", () => {

    // 1. Navigation scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Intersection Observer for Scroll Reveals
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // 3. Parallax Effect for Images
    const parallaxElements = document.querySelectorAll('.parallax-element');
    const slowParallaxElements = document.querySelectorAll('.parallax-element-slow');

    window.addEventListener('scroll', () => {
        let scrolled = window.pageYOffset;
        
        parallaxElements.forEach(el => {
            let offset = el.offsetTop;
            // Simple parallax calculation
            if (scrolled > offset - window.innerHeight && scrolled < offset + el.offsetHeight) {
                let diff = scrolled - (offset - window.innerHeight);
                el.style.transform = `translateY(${diff * 0.05}px)`; 
            }
        });

        slowParallaxElements.forEach(el => {
            let offset = el.offsetTop;
            if (scrolled > offset - window.innerHeight && scrolled < offset + el.offsetHeight) {
                let diff = scrolled - (offset - window.innerHeight);
                el.style.transform = `translateY(${diff * 0.02}px)`; 
            }
        });
    });

    // 4. Smooth Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 5. Reveal Up for benefits
    const revealUpElements = document.querySelectorAll('.reveal-up');
    revealUpElements.forEach(el => {
        revealOnScroll.observe(el);
    });

});

// Modal Logic
function openModal(e) {
    if(e) e.preventDefault();
    const modal = document.getElementById('orderModal');
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('show'), 10);
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('orderModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
}

const PRICE_PER_KG = 1500;
const DELIVERY_CHARGE = 150;

function calcTotal() {
    const qty = parseInt(document.getElementById('orderQty').value) || 1;
    const gheePrice = qty * PRICE_PER_KG;
    const grandTotal = gheePrice + DELIVERY_CHARGE;

    document.getElementById('orderGheePrice').value = gheePrice;
    document.getElementById('gheeTotal').textContent = '৳' + gheePrice;
    document.getElementById('orderTotal').textContent = '৳' + grandTotal;
}

async function submitOrder(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'অপেক্ষা করুন...';

    const qty = parseInt(document.getElementById('orderQty').value) || 1;
    const gheePrice = qty * PRICE_PER_KG;
    const grandTotal = gheePrice + DELIVERY_CHARGE;

    const orderData = {
        name: document.getElementById('orderName').value,
        phone: document.getElementById('orderPhone').value,
        address: document.getElementById('orderAddress').value,
        state: document.getElementById('orderState').value,
        postal_code: document.getElementById('orderPostal').value,
        note: document.getElementById('orderNote').value,
        quantity: qty,
        delivery_charge: DELIVERY_CHARGE,
        total_price: grandTotal
    };

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        
        if(response.ok) {
            document.getElementById('orderForm').style.display = 'none';
            document.getElementById('formSuccess').style.display = 'block';
        } else {
            alert('অর্ডার সাবমিট করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
            submitBtn.disabled = false;
            submitBtn.textContent = 'অর্ডার নিশ্চিত করুন';
        }
    } catch (err) {
        console.error(err);
        alert('নেটওয়ার্ক সমস্যা। দয়া করে আবার চেষ্টা করুন।');
        submitBtn.disabled = false;
        submitBtn.textContent = 'অর্ডার নিশ্চিত করুন';
    }
}

// Close modal if clicked outside
window.onclick = function(event) {
    const modal = document.getElementById('orderModal');
    if (event.target == modal) {
        closeModal();
    }
}
