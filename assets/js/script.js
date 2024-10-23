document.addEventListener("DOMContentLoaded", function () {
    const numbers = document.querySelectorAll('[type="number"]');
    let products = [];
    let displayedProducts = 10;
    const apiUrl = 'https://fakestoreapi.com/products';
    const categoryUrl = 'https://fakestoreapi.com/products/categories';
    fetchCategories();


    for (const numberElement of numbers) {
        numberElement.addEventListener('keyup', isNumber)
    }

    // Sort 
    const priceFilterElements = document.querySelectorAll('.priceFilter');
    for (let index = 0; index < priceFilterElements.length; index++) {
        priceFilterElements[index].addEventListener('click', sortProducts);
    }

    // Search
    document.getElementById('search').addEventListener('input', searchProducts);

    // Load More
    document.getElementById('loadMore').addEventListener('click', loadMoreProducts);

    // Price Sort
    document.getElementById('sortByPrice').addEventListener('change', sortProducts);

    // Price filter
    document.getElementById('minPriceFilter').addEventListener('change', filterProducts);
    document.getElementById('maxPriceFilter').addEventListener('change', filterProducts);

    document.getElementById('filterIcon').addEventListener('click', hideShowFilter);

    function hideShowFilter() {
        if (document.querySelector('.filter-menu').style.display === 'none') {
            document.querySelector('.filter-menu').style.display = 'block'
        }
        else {
            document.querySelector('.filter-menu').style.display = 'none';
        }
    }

    function fetchProducts() {
        setLoading(true);
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                document.querySelector('#loadMore').classList.remove('d-none');
                products = data;
                displayProducts(products.slice(0, displayedProducts));
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                alert('Error fetching products. Please try again later.');
            })
            .finally(() => setLoading(false));
    }

    function fetchCategories() {
        fetch(categoryUrl)
            .then(res => res.json())
            .then(data => {
                displayCategories(data);
                fetchProducts();
                // products = data;
                // displayProducts(products.slice(0, displayedProducts));
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                alert('Error fetching products. Please try again later.');
            })
            .finally(() => setLoading(false));
    }

    function displayProducts(productsToShow) {
        const productList = document.querySelector('#listing');
        productList.innerHTML = ''; // Clear previous list
        productsToShow.forEach(product => {
            // Create a container div for the product card
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');

            // Add image
            const productImage = document.createElement('img');
            productImage.classList.add('product-image');
            productImage.src = product.image;
            productImage.alt = '';

            // Add title
            const productTitle = document.createElement('h4');
            productTitle.textContent = product.title;

            // Add price
            const productPrice = document.createElement('h5');
            productPrice.textContent = `$${product.price}`;

            // Create the favorite container
            const favoriteContainer = document.createElement('div');
            const favoriteIcon = document.createElement('img');
            favoriteIcon.classList.add('favorite');
            favoriteIcon.src = './assets/images/heart.svg';
            favoriteIcon.alt = '';

            // Append the favorite icon to its container
            favoriteContainer.appendChild(favoriteIcon);

            // Append all elements to the product card
            productCard.appendChild(productImage);
            productCard.appendChild(productTitle);
            productCard.appendChild(productPrice);
            productCard.appendChild(favoriteContainer);

            // Append the product card to the product list
            productList.appendChild(productCard);
        });

        document.querySelector('.counter-with-filter span').innerHTML = (+productsToShow.length || 0) + ' Results'
    }

    function displayCategories(data) {
        const checkboxList = document.getElementById('checkboxList');
        data.forEach(labelText => {
            // Create the label element
            const label = document.createElement('label');
            label.classList.add('checkbox-container');
            label.textContent = labelText;

            // Create the input element (checkbox)
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.classList = 'categoryFilterCheckbox';
            input.value = labelText;

            // Create the span element (for the custom checkmark)
            const span = document.createElement('span');
            span.classList.add('checkmark');

            // Append input and span to the label
            label.appendChild(input);
            label.appendChild(span);

            // Append the label to the container
            checkboxList.appendChild(label);
            label.querySelector('input').addEventListener('change', filterProducts)
        });
    }

    function filterProducts(event) {
        // Price filter
        if (event.target.hasAttribute('id')) {
            let minPrice = +document.getElementById('minPriceFilter').value || 0;
            let maxPrice = +document.getElementById('maxPriceFilter').value || 0;
            if (minPrice > maxPrice) {
                document.getElementById('maxPriceFilter').value = document.getElementById('minPriceFilter').value;
                maxPrice = minPrice
            }
            const filtered = products.filter(product => {
                return product.price >= minPrice && product.price <= maxPrice
            });
            displayProducts(filtered);
        }
        // Category filter
        else {
            let selectedCategoryId = [];
            let selectedCategories = document.querySelectorAll('.categoryFilterCheckbox:checked');
            for (const selectedCategory of selectedCategories) {
                selectedCategoryId.push(selectedCategory.value.toLowerCase());
            }
            if (selectedCategories.length) {
                const filtered = products.filter(product => selectedCategoryId.includes(product.category.toLowerCase()));
                displayProducts(filtered);
            }
            else {
                displayedProducts = 10;
                fetchProducts();
            }
        }

        removeLoadMoreBtn();

        // let high = event.target.getAttribute('data-type') == 'highToLow' ?

        // const category = document.getElementById('categoryFilter').value;
        // const filtered = products.filter(product =>
        //     category === '' || product.category === category
        // );
        // displayProducts(filtered.slice(0, displayedProducts));
    }

    function loadMoreProducts() {
        displayedProducts += 10;
        if (displayedProducts === 20) {
            removeLoadMoreBtn();
        }
        const moreProducts = products.slice(0, displayedProducts);
        displayProducts(moreProducts);
    }

    function sortProducts(event) {
        const sortOrder = event.target.value == 'highToLow' ? 'desc' : 'asc';
        const sorted = [...products].sort((a, b) => {
            if (sortOrder === 'asc') return a.price - b.price;
            if (sortOrder === 'desc') return b.price - a.price;
            return 0;
        });
        displayProducts(sorted);
        removeLoadMoreBtn();
    }

    function searchProducts() {
        const searchTerm = document.getElementById('search').value.toLowerCase();
        const filtered = products.filter((product) => {
            return product.title.match(new RegExp(searchTerm, 'i'))
        });
        displayProducts(filtered);
        removeLoadMoreBtn()
    }

    function setLoading(isLoading) {
        const loader = document.querySelector('.loader');
        if (isLoading) {
            loader.classList.add('loading');
        } else {
            loader.classList.remove('loading');
        }
    }

    function isNumber(event) {
        event.target.value = +event.target.value;
    }

    function removeLoadMoreBtn() {
        let loadMore = document.querySelector('#loadMore');
        if (loadMore) {
            loadMore.classList = 'd-none';
        }
    }
});

