
const driver = require('bigchaindb-driver')
const IPFS = require('ipfs')
const Repo = require('ipfs-repo')
const repo = new Repo('/tmp/ipfs-repo')
const fs = require("fs")


const node = new IPFS({ repo: repo })

const conn = new driver.Connection('https://test.bigchaindb.com/api/v1/')

//const alice = new driver.Ed25519Keypair()
//console.log(alice)

let broadCast = function (path, name, category, owner, publicKey, privateKey, callback) {

    node.on('ready', () => {
        // Your node is now ready to use \o/

        let file = fs.readFileSync(path); // Read Provided File      
        let buf = new Buffer(file);

        console.log("b", buf)

        node.add(buf, { recursive: true }, (err, result) => {
            if (err) { callback(err) }
            console.log(result)
            if (result && (result[0]) && (result[0].path)) {
                let asset =
                {
                    "type": "IP",
                    "name": name,
                    "datetime": new Date().toString(),
                    "category": category,
                    "owner": owner,
                    "ipfsPath": result[0].hash
                }

                const tx = driver.Transaction.makeCreateTransaction(
                    asset,
                    null,
                    [driver.Transaction.makeOutput(
                        driver.Transaction.makeEd25519Condition(publicKey))],
                        publicKey)
                const txSigned = driver.Transaction.signTransaction(tx, privateKey)
                conn.postTransactionCommit(txSigned).then(() => { callback(txSigned.id) })

            }
        })


        // stopping a node
        node.stop(() => {
            // node is now 'offline'
        })
    })
}

// let query = function async (publicKey,callback) {
//     node.on('ready', () => {
//         let reply = [];
//         conn.listOutputs(publicKey, false).then((unspentOutputs) => {
//             for(let i=0;i<unspentOutputs.length;i++){
//                 conn.getTransaction(unspentOutputs[i].transaction_id).then((result) => {
//                     if(result){
//                           console.log(result.asset.data.type)
//                           if(result && (result.asset) && (result.asset.data) && (result.asset.data.type) && (result.asset.data.type === "IP"))
//                                   reply.push(result.asset.data)
//                                 //   console.log("files",result.asset.data.ipfsPath)         
//                             if(result.asset.data.ipfsPath){
//                                 node.get(result.asset.data.ipfsPath, function (err, files) {
//                                         // console.log("f",files,result.asset.data.ipfsPath)
//                                   files.forEach((file) => {
//                                         // console.log("f2")
//                                         if(file.content){
//                                           if(i === (unspentOutputs.length - 1)){
//                                             //   console.log("re",file.content)
//                                               callback(reply,file.content);
//                                         }                                              
//                                       }
//                                       })
//                                   })
//                             }
//                         }
//                 })
//             }
//         })
    
//       node.stop(() => {
//         // node is now 'offline'
//       })    
//     })
// }



let query = function async (publicKey,callback) {
    node.on('ready', () => {
        let reply = [];
        conn.listOutputs(publicKey, false).then((unspentOutputs) => {
            //console.log("t",unspentOutputs.length)
                let i = 0;
                unspentOutputs.forEach((uO) => {
                conn.getTransaction(uO.transaction_id).then((result) => {
                    if(result){
                          //console.log("res",i,unspentOutputs.length -1, result.asset.data.type)
                          if(result && (result.asset) && (result.asset.data) && (result.asset.data.type) && (result.asset.data.type === "Treaty"))
                                  reply.push(result.asset.data)
                          if(i == (unspentOutputs.length-1)){
                              console.log("re",uO.transaction_id)
                              callback(reply);
                             }
                        }
                i++;                    
                })                    
            });

            })
        })
    
      node.stop(() => {
        // node is now 'offline'
      })    
}








let addMapping = function async(country, publicMapp, publicKey, privateKey, callback) {
    let asset =
    {
        "type": "Treaty",
        "country": country,
        "datetime": new Date().toString(),
    "publicKey": publicMapp
    }

    const tx = driver.Transaction.makeCreateTransaction(
        asset,
        null,
        [driver.Transaction.makeOutput(
            driver.Transaction.makeEd25519Condition(publicKey))],
        publicKey)
    const txSigned = driver.Transaction.signTransaction(tx, privateKey)
    conn.postTransactionCommit(txSigned).then(() => { callback(txSigned.id) })

}

let getMapping = function async(publicKey, callback) {

    conn.listOutputs(publicKey, false).then((unspentOutputs) => {
        let reply = [];
        for (let i = 0; i < unspentOutputs.length; i++) {
            conn.getTransaction(unspentOutputs[i].transaction_id).then((result) => {
                if (result !== undefined) {
                    console.log("es", result.asset.data.type)
                    if (result && (result.asset) && (result.asset.data) && (result.asset.data.type) && (result.asset.data.type === "Treaty"))
                        reply.push(result.asset.data)
                    if (i === (unspentOutputs.length - 1)) {
                        //console.log("re")
                        callback(reply);
                    }
                }
            })
        }
    })
}


// query("CzWKAz4TJnXm6gVffMduP12sAPM1PPfTx6jaF2MWjj8T", (reply, image) => {
//     console.log("rep", reply, image)
// })


// broadCast("../../public/favicon.ico","Catalyst Business Process", "Non-Fiction", "Dipu RBwala", "CzWKAz4TJnXm6gVffMduP12sAPM1PPfTx6jaF2MWjj8T", "B7Vsp2KwYDUHJ9BfnQdvgYywLWpig35RM3HTpwTfGGR", (reply) => {
//     console.log("b", reply)
// })


/*
addMapping("France", "BnzL9MwXroqKnUpydPfbWNqBuvMhadUFHaZ91qTnEapY","CzWKAz4TJnXm6gVffMduP12sAPM1PPfTx6jaF2MWjj8T", "B7Vsp2KwYDUHJ9BfnQdvgYywLWpig35RM3HTpwTfGGR",(reply) => {
    console.log("b", reply)
})
*/
/*
getMapping("CzWKAz4TJnXm6gVffMduP12sAPM1PPfTx6jaF2MWjj8T", (reply) => {
    console.log("rep",reply)
})
*/
module.exports = { query, broadCast, addMapping, getMapping };