const firebaseConfig = {

  apiKey: "AIzaSyC146UcYNh5awrpzmEFk08wdHz8zB_fdNs",

  authDomain: "fir-94386.firebaseapp.com",

  databaseURL: "https://fir-94386.firebaseio.com",

  projectId: "fir-94386",

  storageBucket: "fir-94386.appspot.com",

  messagingSenderId: "294986841577",

  appId: "1:294986841577:web:88e5a2ccdae1518d541f78"

};


/*const firebaseConfig = {
  apiKey: "AIzaSyBevZByRCod70nS5O6zJJJSOuss_-dCl7o",
  authDomain: "pizzaplanet-4fb08.firebaseapp.com",
  projectId: "pizzaplanet-4fb08",
  storageBucket: "pizzaplanet-4fb08.appspot.com",
  messagingSenderId: "129992450982",
  appId: "1:129992450982:web:3b57dca4ca5e8748742567",
  measurementId: "G-FS2ET8STHR"
};*/

//Inicializando o Firebase
firebase.initializeApp(firebaseConfig)
//Definindo a URL padrão do site
const urlApp = 'http://127.0.0.1:5500'

var id_editar = "";
var valorTotal = 0;

function logaGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider()
  firebase.auth().signInWithPopup(provider)
    .then((result) => {

      if (localStorage.getItem("tipo_usuario") == "cliente") {
        window.location.href = 'pedidos.html'
      }
      else if (localStorage.getItem("tipo_usuario") == "funcionario") {
        window.location.href = 'area_funcionario.html'
      } else {
        console.log("Erro ao verificar o tipo de usuário")
      }

    }).catch((error) => {
      alert(`Erro ao efetuar o login: ${error.message}`)
    })
}

function paginaLoginTipoUsuario(tipo_usuario) {
  if (localStorage.getItem('usuarioId') == null) {

    if (tipo_usuario == "cliente") {
      localStorage.setItem("tipo_usuario", "cliente");
    } else if (tipo_usuario == "funcionario") {
      localStorage.setItem("tipo_usuario", "funcionario");
    }

  } else {

    if (tipo_usuario == "cliente") {
      window.location.href = 'pedidos.html'
    } else if (tipo_usuario == "funcionario") {
      window.location.href = 'area_funcionario.html'
    }

  }
}

function verificaLogado() {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      localStorage.setItem('usuarioId', user.uid)

      let imagem = document.getElementById('imagemUsuario')

      user.photoURL
        ? imagem.innerHTML += `<img src="${user.photoURL}" title="${user.displayName}" class="img rounded-circle" width="48" />`
        : imagem.innerHTML += '<img src="images/logo-google.svg" title="Usuário sem foto" class="img rounded-circle" width="32" />'

    } else {
      localStorage.removeItem('usuarioId') //Removemos o id salvo
      window.location.href = 'index.html' //direcionamos para o login        
    }
  })
}

function logoutFirebase() {
  firebase.auth().signOut()
    .then(function () {
      localStorage.removeItem('usuarioId')
      window.location.href = 'index.html'
    })
    .catch(function (error) {
      alert(`Não foi possível efetuar o logout: ${error.message}`)
    })
}

async function salvaPedido(pedido) {
  let usuarioAtual = firebase.auth().currentUser
  console.log(usuarioAtual)
  try {
    await firebase.database().ref('pedidos').push({
      ...pedido,
      dadosUsuario: {
        uid: usuarioAtual.uid,
        nome: usuarioAtual.displayName
      }
    })
    alert('🍕🍕🍕Seu pedido foi Enviado! 🍕🍕🍕\n🍕🍕🍕Agradecemos pela preferência 🍕🍕🍕')

    document.getElementById('formPedido').reset()

  } catch (error) {
    alert(`Erro ao salvar: ${error.message}`)
  }
}

//evento submit do formulário
document.getElementById('formPedido').addEventListener('submit', function (event) {
  event.preventDefault()

  var validacao = false;

  var nome = document.getElementById('nome').value;
  var cep = document.getElementById('cep').value;
  var endereco = document.getElementById('endereco').value;
  var numero = document.getElementById('numero').value;
  var valor = valorTotal;
  var pagamento = document.getElementById('pagamento').value;

  var pizzas = [];

  if (document.getElementById('chk_calabresa').checked) {
    pizzas.push({
      "nome_pizza": "Calabresa"
    });
    validacao = true;
  }

  if (document.getElementById('chk_atum').checked) {
    pizzas.push({
      "nome_pizza": "Atum"
    });
    validacao = true;
  }

  if (document.getElementById('chk_frango').checked) {
    pizzas.push({
      "nome_pizza": "Frango"
    });
    validacao = true;
  }

  if (document.getElementById('chk_doritos').checked) {
    pizzas.push({
      "nome_pizza": "Doritos"
    });
    validacao = true;
  }

  if (document.getElementById('chk_queijos').checked) {
    pizzas.push({
      "nome_pizza": "Quatro Queijos"
    });
    validacao = true;
  }

  if (document.getElementById('chk_modacasa').checked) {
    pizzas.push({
      "nome_pizza": "Moda da Casa"
    });
    validacao = true;
  }

  if (validacao == true) {
    const pedido = {
      nome_cliente: nome,
      cep: cep,
      endereco: endereco,
      numero: numero,
      valor_total: valor,
      forma_pagamento: pagamento,
      pizzas: pizzas
    }

    if (id_editar == "") {
      salvaPedido(pedido)
    } else {
      atualizaPedido(id_editar, pedido)
      id_editar = "";
    }

  } else {
    alert("🍕🍕🍕Escolha um sabor de Pizza!🍕🍕🍕")
  }
})

async function carregaPedidos() {
  const tabela = document.getElementById('dadosTabela')
  const usuarioAtual = localStorage.getItem('usuarioId')

  await firebase.database().ref('pedidos').orderByChild('nome_cliente')
    .on('value', (snapshot) => {
      //Limpamos a tabela
      tabela.innerHTML = ``
      if (!snapshot.exists()) { //não existe o snapshot?
        tabela.innerHTML = `<tr class='table-danger'><td colspan='4'>Ainda não existe nenhum pedido cadastrado.</td></tr>`
      } else { //se existir o snapshot, montamos a tabela
        snapshot.forEach(item => {
          const dados = item.val() // obtém os dados
          const id = item.key // obtém o id

          const isUsuarioAtual = (dados.dadosUsuario.uid === usuarioAtual)

          if (isUsuarioAtual) {
            const botaoExcluir = `<button class='btn btn-sm btn-danger mb-2' onclick='removePedido("${id}")'
           title='Excluir o registro atual'>🗑 Excluir</button>`

            const botaoEditar = `<button class='btn btn-sm btn-warning' onclick='carregaPedidoAtualizar("${id}")'
           title='Editar o registro atual'>📝 Editar</button>`

            var mostrar_pizzas = "";

            for (var i = 0; i < dados.pizzas.length; i++) {
              if (i != 0) {
                mostrar_pizzas += "<br>"
              }
              mostrar_pizzas += `${(i + 1)}. ${dados.pizzas[i].nome_pizza}`
            }

            tabela.innerHTML += `
        <tr>
           <td>${dados.nome_cliente}</td>
           <td>${dados.cep}</td>
           <td>${dados.endereco}</td>
           <td>${dados.numero}</td>
           <td>R$ ${dados.valor_total}</td>
           <td>${dados.forma_pagamento}</td>
           <td>${mostrar_pizzas}</td>
           <td>${botaoExcluir}<br>${botaoEditar}</td>
        </tr>
        `
          }
        })
      }
    })
}

async function carregaPedidosFuncionario() {
  const tabela = document.getElementById('dadosTabela')

  await firebase.database().ref('pedidos').orderByChild('nome_cliente')
    .on('value', (snapshot) => {
      //Limpamos a tabela
      tabela.innerHTML = ``
      if (!snapshot.exists()) { //não existe o snapshot?
        tabela.innerHTML = `<tr class='table-danger'><td colspan='4'>Ainda não existe nenhum pedido cadastrado.</td></tr>`
      } else { //se existir o snapshot, montamos a tabela
        snapshot.forEach(item => {
          const dados = item.val() // obtém os dados
          const id = item.key // obtém o id

          const botaoExcluir = `<button class='btn btn-sm btn-danger mb-2' onclick='removePedido("${id}")'
           title='Excluir o registro atual'>🗑 Excluir</button>`

          var mostrar_pizzas = "";

          for (var i = 0; i < dados.pizzas.length; i++) {
            if (i != 0) {
              mostrar_pizzas += "<br>"
            }
            mostrar_pizzas += `${(i + 1)}. ${dados.pizzas[i].nome_pizza}`
          }

          tabela.innerHTML += `
        <tr>
           <td>${dados.nome_cliente}</td>
           <td>${dados.cep}</td>
           <td>${dados.endereco}</td>
           <td>${dados.numero}</td>
           <td>R$ ${dados.valor_total}</td>
           <td>${dados.forma_pagamento}</td>
           <td>${mostrar_pizzas}</td>
           <td>${botaoExcluir}<br>${botaoEditar}</td>
        </tr>
        `

        })
      }
    })
}

async function removePedido(id) {
  if (confirm('Deseja realmente excluir o pedido?')) {
    const pedidoRef = await firebase.database().ref('pedidos/' + id)

    //Remova o prestador do Firebase
    pedidoRef.remove()
      .then(function () {
        alert('Pedido excluído com sucesso!')
      })
      .catch(function (error) {
        alert(`Erro ao excluir o pedido: ${error.message}. Tente novamente`)
      })
  }
}

async function atualizaPedido(id, pedido) {
  if (confirm('Deseja realmente atualizar o pedido?')) {
    const pedidoRef = await firebase.database().ref('pedidos/' + id)

    //Atualiza o pedido do Firebase
    pedidoRef.update(pedido)
      .then(function () {
        alert('Pedido atualizado com sucesso!')
      })
      .catch(function (error) {
        alert(`Erro ao atualizar o pedido: ${error.message}. Tente novamente`)
      })
  }
}

function carregaPedidoAtualizar(id) {
  if (confirm("Deseja editar as informações do pedido?")) {

    firebase.database().ref('pedidos/' + id).get()
      .then((snapshot) => {

        if (snapshot.exists()) {
          const dados = snapshot.val()

          document.getElementById('nome').value = dados.nome_cliente;
          document.getElementById('cep').value = dados.cep;
          document.getElementById('endereco').value = dados.endereco;
          document.getElementById('numero').value = dados.numero;
          valorTotal = dados.valor_total;
          document.getElementById('valor_total').value = "R$ " + valorTotal;
          document.getElementById('pagamento').value = dados.forma_pagamento;

          var check_calabresa = false;
          var check_atum = false;
          var check_frango = false;
          var check_doritos = false;
          var check_queijos = false;
          var check_modacasa = false;

          for (var i = 0; i < dados.pizzas.length; i++) {
            console.log(dados.pizzas[i].nome_pizza)

            switch (dados.pizzas[i].nome_pizza) {
              case "Calabresa":
                check_calabresa = true;
                break;
              case "Atum":
                check_atum = true;
                break;
              case "Frango":
                check_frango = true;
                break;
              case "Doritos":
                check_doritos = true;
                break;
              case "Quatro Queijos":
                check_queijos = true;
                break;
              case "Moda da Casa":
                check_modacasa = true;
                break;
            }
          }

          document.getElementById('chk_calabresa').checked = check_calabresa;
          document.getElementById('chk_atum').checked = check_atum;
          document.getElementById('chk_frango').checked = check_frango;
          document.getElementById('chk_doritos').checked = check_doritos;
          document.getElementById('chk_queijos').checked = check_queijos;
          document.getElementById('chk_modacasa').checked = check_modacasa;

          id_editar = id;
        } else {
          console.log("No data available");
        }
      }).catch((error) => {
        console.error(error);
      });
  }
}

function calculaValorTotal() {
  valorTotal = 0;

  if (document.getElementById('chk_calabresa').checked) {
    valorTotal += 55;
  }

  if (document.getElementById('chk_atum').checked) {
    valorTotal += 45;
  }

  if (document.getElementById('chk_frango').checked) {
    valorTotal += 60;
  }

  if (document.getElementById('chk_doritos').checked) {
    valorTotal += 60;
  }

  if (document.getElementById('chk_queijos').checked) {
    valorTotal += 65;
  }

  if (document.getElementById('chk_modacasa').checked) {
    valorTotal += 45;
  }

  document.getElementById('valor_total').value = `R$ ${valorTotal}`;
}

function redirecionarPedido(pizza) {
  window.location.href = 'pedidos.html';
  localStorage.setItem('pizzaSelecionada', pizza);
}

function carregarPizzaSelecionada() {
  if (localStorage.getItem('pizzaSelecionada')) {
    switch (localStorage.getItem('pizzaSelecionada')) {
      case "calabresa":
        document.getElementById('chk_calabresa').checked = true;
        break;
      case "atum":
        document.getElementById('chk_atum').checked = true;
        break;
      case "frango":
        document.getElementById('chk_frango').checked = true;
        break;
      case "doritos":
        document.getElementById('chk_doritos').checked = true;
        break;
      case "queijos":
        document.getElementById('chk_queijos').checked = true;
        break;
      case "modacasa":
        document.getElementById('chk_modacasa').checked = true;
        break;
    }

    localStorage.removeItem('pizzaSelecionada');

    calculaValorTotal();
  }
}
