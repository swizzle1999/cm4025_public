let User = require("./schemas/userSchema");
const config = require("./serverConfig.json")

//This is a simple function that updates all users money every single second
function ticker(){
    User.find({}).select("money afkMax")
    .then(data => {
        if (data){
            data.forEach(user => {
                if (user.money + config.moneyTickAmmount <= user.afkMax){
                    user.money += config.moneyTickAmmount;
                } else {
                    user.money = user.afkMax;
                }
                user.save()
            })
        }
    })
}
    

setInterval(ticker, config.tickEveryXSeconds*1000);

exports.ticker = ticker();