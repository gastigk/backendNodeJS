const socket = io() 

const table = document.getElementById('realProductsTable')

document.getElementById('createBtn').addEventListener('click', () => {
    const body = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        price: document.getElementById('price').value,
        code: document.getElementById('code').value,
        stock: document.getElementById('stock').value,
        category: document.getElementById('category').value,
    }
    fetch('/api/products', {
        method: 'post',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(result => result.json())
        .then(result => {
            if (result.status === 'error') throw new Error(result.error)
        })
        .then(() => fetch('/api/products'))
        .then(result => result.json())
        .then(result => {
            if (result.status === 'error') throw new Error(result.error)
            socket.emit('productList', result.payload)
            alert(`Ok. Todo salió bien! :)\nEl producto se ha agregado con éxito!\n\nVista actualizada!`)
            document.getElementById('title').value = ''
            document.getElementById('description').value = ''
            document.getElementById('price').value = ''
            document.getElementById('code').value = ''
            document.getElementById('stock').value = ''
            document.getElementById('category').value = ''
        })
        .catch(err => alert(`Ocurrió un error :(\n${err}`))
})

deleteProduct = (id) => {
    fetch(`/api/products/${id}`, {
        method: 'delete',
    })
        .then(result => result.json())
        .then(result => {
            if (result.status === 'error') throw new Error(result.error)
            socket.emit('productList', result.payload)
            alert(`Ok. Todo salió bien! :)\nEl producto eliminado con éxito!`)
        })
        .catch(err => alert(`Ocurrió un error :(\n${err}`))
}

socket.on('updatedProducts', data => {
    table.innerHTML = 
        `<tr>
            <td></td>
            <td><strong>Producto</strong></td>
            <td><strong>Descripción</strong></td>
            <td><strong>Precio</strong></td>
            <td><strong>Código</strong></td>
            <td><strong>Stock</strong></td>
            <td><strong>Categoría</strong></td>
        </tr>`;
        for (product of data) {
            let tr = document.createElement('tr')
            tr.innerHTML=
                        `   <td><button class="btn btn-danger" onclick="deleteProduct('${product._id}')">Eliminar</button></td>
                            <td>${product.title}</td>
                            <td>${product.description}</td>
                            <td>${product.price}</td>
                            <td>${product.code}</td>
                            <td>${product.stock}</td>
                            <td>${product.category}</td>
                        `;
            table.getElementsByTagName('tbody')[0].appendChild(tr);
        }
} )