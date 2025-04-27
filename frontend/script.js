document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('productForm');
    const loadProductsButton = document.getElementById('loadProducts');
    const productCatalog = document.getElementById('productCatalog');
    const formMessage = document.getElementById('formMessage');

    productForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const productName = document.getElementById('productName').value;
        const price = parseFloat(document.getElementById('price').value);
        const description = document.getElementById('description').value;
        const imageFile = document.getElementById('image').files[0];

        if (!productName || !description || isNaN(price)) {
            displayMessage('Por favor, preencha todos os campos obrigatórios.', 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('nome', productName);
        formData.append('descricao', description);
        formData.append('preco', price);
        if (imageFile) {
            formData.append('imagem', imageFile);
        }

        try {
            const response = await fetch('http://192.168.100.102:3000/api/produtos', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                displayMessage(`Produto '${productName}' cadastrado com sucesso!`, 'success');
                productForm.reset();
            } else {
                displayMessage(`Houve um problema ao cadastrar o produto '${productName}': ${data.error || 'Erro desconhecido'}`, 'error');
            }
        } catch (error) {
            console.error('Erro ao enviar dados:', error);
            displayMessage('Erro ao enviar dados para o servidor.', 'error');
        }
    });

    loadProductsButton.addEventListener('click', async () => {
        try {
            const response = await fetch('http://192.168.100.102:3000/api/produtos');
            const data = await response.json();

            if (response.ok) {
                displayProducts(data);
            } else {
                displayMessage(`Erro ao carregar produtos: ${data.error || 'Erro desconhecido'}`, 'error');
            }
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            displayMessage('Erro ao carregar produtos do servidor.', 'error');
        }
    });

    function displayMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = `message ${type}`;
        setTimeout(() => {
            formMessage.textContent = '';
            formMessage.className = 'message';
        }, 5000); // Limpa a mensagem após 5 segundos
    }

    function displayProducts(products) {
        productCatalog.innerHTML = ''; // Limpa o catálogo anterior
        if (products && products.length > 0) {
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.classList.add('product-card');
                productCard.innerHTML = `
                    <h3>${product.nome}</h3>
                    <p><strong>Descrição:</strong> ${product.descricao}</p>
                    <p><strong>Preço:</strong> R$ ${parseFloat(product.preco).toFixed(2)}</p>
                    ${product.imagem_url ? `<img src="${product.imagem_url}" alt="Imagem do produto" width="200" height="200">` : '<p>Sem imagem disponível.</p>'}
                    <hr>
                `;
                productCatalog.appendChild(productCard);
            });
        } else {
            productCatalog.innerHTML = '<p>Nenhum produto encontrado no catálogo.</p>';
        }
    }
});