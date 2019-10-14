let myName = ''
let messagesOnBlockchain = ''

window.web3 = new Web3(window.web3 ? window.web3.currentProvider : new Web3.providers.HttpProvider('http://183.82.116.216:7545'))

const contractABI = [{ "constant": false, "inputs": [{ "internalType": "string", "name": "name", "type": "string" }], "name": "createUser", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "string", "name": "message", "type": "string" }], "name": "writeMessage", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "string", "name": "message", "type": "string" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }], "name": "newMessageEvent", "type": "event" }, { "constant": true, "inputs": [], "name": "getUserCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "userAddress", "type": "address" }], "name": "getUsernameForAddress", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }]
const contractAddress = '0x0ff2ce7ee89dafaaee772a0b94ef291e8d7a4904'
const contractInstance = web3.eth.contract(contractABI).at(contractAddress)

if (localStorage.getItem("isUserRegistered")) {
    web3.eth.defaultAccount = localStorage.getItem("dAppAccount")
    console.log("Default Account: ", web3.eth.defaultAccount)
    document.getElementById("chat-box-panel").style.display = "block"
    document.getElementById("register-panel").style.display = "none"
    listenToEvents()
    updateFields()
} else {
    document.getElementById("chat-box-panel").style.display = "none"
    document.getElementById("register-panel").style.display = "block"

    contractInstance.getUserCount((error, resp) => {
        if (error) alert(error)

        console.log("User Count: ", resp.c[0])
        localStorage.setItem("dAppAccount", web3.eth.accounts[resp.c[0]])
        web3.eth.defaultAccount = web3.eth.accounts[resp.c[0]]
        console.log("Default Account: ", web3.eth.defaultAccount)
    })
}

var modal = document.getElementById("myModal")
var span = document.getElementsByClassName("close")[0]
var chatPanelScroll = document.getElementById('panel-body')

var registerInput = document.getElementById("registerInput")
var createButton = document.getElementById("createButton")
registerInput.addEventListener("keyup", function (event) {
    if (event.target.value.length > 0) {
        createButton.disabled = false
    } else {
        createButton.disabled = true
    }
    if (event.keyCode === 13) {
        event.preventDefault()
        document.getElementById("createButton").click()
    }
})
var messageInput = document.getElementById("messageInput")
var sendButton = document.getElementById("sendButton")
messageInput.addEventListener("keyup", function (event) {
    if (event.target.value.length > 0) {
        sendButton.disabled = false
    } else {
        sendButton.disabled = true
    }
    if (event.keyCode === 13) {
        event.preventDefault()
        sendButton.click()
    }
})

function updateFields() {
    var headerFields = ''
    web3.eth.getBalance(web3.eth.defaultAccount, (err, resp) => {
        contractInstance.getUsernameForAddress(web3.eth.defaultAccount, (err, name) => {
            var balance = parseFloat(Math.round(web3.toDecimal(resp)) / 1000000000000000000).toFixed(6)
            headerFields += `
                <b class="col-md-3">Name: &nbsp; ${name}</b>
                <b class="col-md-6">Account: &nbsp; ${web3.eth.defaultAccount}</b>
                <b class="col-md-3">Balance: &nbsp; ${balance} (ETH)</b>
            `
            document.querySelector('#headerFields').innerHTML = headerFields
        })
    })
}

function createUser() {
    contractInstance.createUser(registerInput.value, (error, resp) => {
        if (error) alert(error)
        console.log("Success Creating User name, Hash: ", resp)
        localStorage.setItem("isUserRegistered", true)
        document.getElementById("chat-box-panel").style.display = "block"
        document.getElementById("register-panel").style.display = "none"
        listenToEvents()
        updateFields()
    })
}

function sendMessage() {
    console.log("Entered message: ", messageInput.value)
    contractInstance.writeMessage(messageInput.value, {
        from: web3.eth.defaultAccount,
        gas: 500000
    }, (err, resp) => {
        if (err) alert(err)
        console.log("Success, Hash: ", resp)
        sendButton.disabled = true
        updateFields()
    })
    messageInput.value = ''
}

function addMessages(event) {
    contractInstance.getUsernameForAddress(event.args.sender, (err, name) => {
        if (err) alert(err)
        messagesOnBlockchain += `
        <div class="media">
            <div class="media-body">
                <div class="media">
                    <a class="pull-left" href="#" onclick="showModal('${event.args.sender}', '${event.blockNumber}', '${event.blockHash}', '${event.transactionHash}')">
                        <img class="media-object img-circle " src="assets/img/click.jpg" height="50"/>
                    </a>
                    <div class="media-body">
                        ${event.args.message}
                        <br />
                        <small class="text-muted"><b>${name}</b> | ${formatDate(new Date(event.args.timestamp.c[0] * 1000))}</small>
                        <hr />
                    </div>
                </div>
            </div>
        </div>
        `
        document.querySelector('#chat-box').innerHTML = messagesOnBlockchain
        chatPanelScroll.scrollTop = chatPanelScroll.scrollHeight
    })
}

function showModal(senderAddress, blockNumber, blockHash, transactionHash) {
    modal.style.display = "block"
    blockDataToInsert = `    
    <div class="row">
        <div class="col-md-3"><b>Sender Address:</b></div>
        <div class="col-md-9">${senderAddress}</div>
    </div>
    <div class="row">
        <div class="col-md-3"><b>Block Number:</b></div>
        <div class="col-md-9">${blockNumber}</div>
    </div>
    <div class="row">
        <div class="col-md-3"><b>Block Hash:</b></div>
        <div class="col-md-9">${blockHash}</div>
    </div>
    <div class="row">
        <div class="col-md-3"><b>Transaction Hash:</b></div>
        <div class="col-md-9">${transactionHash}</div>
    </div>
    `
    document.querySelector('#transaction-details').innerHTML = blockDataToInsert
}

span.onclick = function () {
    modal.style.display = "none"
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none"
    }
}

function formatDate(date) {
    var hours = date.getHours()
    var minutes = date.getMinutes()
    var ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12
    minutes = minutes < 10 ? '0' + minutes : minutes
    var strTime = hours + ':' + minutes + ' ' + ampm
    return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear() + " " + strTime
}

function listenToEvents() {
    contractInstance.newMessageEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
    }).watch(function (error, event) {
        if (error) alert(error)
        addMessages(event)
    })
}

