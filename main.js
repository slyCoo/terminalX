const socket = io();

let currentTarget = null;
let trace = 0;
let credits = 0;
let connections = []

let username = "guest";


//system files 
let system = {
    files: [
        { name: "rootsec", type: "file", data: "file", protected: "yes" }
    ]
}


//console function lists
const commands = {
    help: runHelp,
    clear: runClear,
    about: runAbout,
    version: runVersion,
    lf,
    cf,
    rf,
    ef,
    df,
    scan,
    sel: select,
    connect,
    admin,
    rocrypt,
    pt: protected,
    phish,
    bf: bruteForce,
    inspip :  InspectIP,
    user,
    msg,
    chat
}

function runHelp(){
    writeTextInstant("help \n clear \n about \n version \n lf \n cf \n rf \n ef \n df \n scan \n pt \n connect \n admin \n rocrypt \n phish \n bf \n inspip \n user \n msg \n chat" )
}
function runClear(){
    writeTextInstant("")
}
function runAbout(){
    writeTextInstant("MYconsole is a browser-based terminal simulator that lets you run custom commands in a fake command-line interface. It’s built with JavaScript and designed to feel like a simple, interactive shell inside the web.")
}
function runVersion(){
    writeTextInstant("0.0.1v alpha")
}
function lf(args)
{
    if(args.length === 0)
    {
        let output = system.files.map(item => item.name).join("\n")
         writeTextInstant(output || "empty folder")
    }else
    {
        let found = system.files.find(item => item.name == args[0])
        
        if(found){
            writeTextInstant("found: " + found.name + "\n isProtected:" + found.protected)
        }else
        {
            writeTextInstant("couldn't find file")
        }
        
    }
}

function cf(args, flags)
{
    let name = args[0]
    let isProtected = flags.includes("-pt")
    system.files.push({
        name: name,
        type: "file",
        data: "",
        protected: isProtected ? "yes" : "no"
    })

    writeTextInstant("created: " + name)
}
function rf(args)
{
    let fileName = args[0]

    let file = system.files.find(f => f.name === fileName)

    if(!file)
    {
        writeTextInstant("file not found")
        return
    }

    writeTextInstant(file.data || "(empty file)")
}
function ef(args, flags)
{
    let fileName = args[0]
    let content = args.slice(1).join(" ")
    
    let file = system.files.find(f => f.name == fileName)
    
     if(!file)
    {
        writeTextInstant("file not found")
        return
    }else if(file.protected == "yes")
    {
        writeTextInstant("file protected")
        return
    }
    
    file.data = content
    writeTextInstant("file edited: " + fileName)

}

function df(args)
{
    let fileName = args[0];

    let index = system.files.findIndex(f => f.name === fileName);

    if(index === -1)
    {
        writeTextInstant("file not found");
        return;
    }

    let removed = system.files.splice(index, 1);

    writeTextInstant("deleted: " + removed[0].name);
}

function scan(args , flags)
{
    let select = flags.includes("-sel")
    
    if(select === true && connections.length > 0)
    {
        let selection = args[0] - 1
        writeTextInstant("> " + connections[selection].ip)
        
    }else if(select === true && connections.length <= 0)
    {
        writeTextInstant("no connections to choose from ")

    }else{
        
    //randomize ip adresses and names
      let number1; 
      let number2;
        connections = []
    for(let i = 0; i < 10 ; i++)
    {
        number2 = Math.floor(Math.random() * 256)
        number1 = Math.floor(Math.random() * 256)
        let generatedConnection = "192.168."+ number1 + "." + number2
        
        connections.push({
            name: "targaet: " + (i +1),
            ip: generatedConnection
        })
    }
    
        let mapped = connections.map((f, i) =>
        `${i +1 }: ${f.ip}`).join("\n")
    writeTextInstant(mapped)
    }
}

function connect(){}
function admin(){}
function rocrypt(){}
function protected(){}
function select(args)
{
    let index = args[0] - 1;

    if(!connections[index])
    {
        writeTextInstant("invalid target");
        return;
    }

    currentTarget = connections[index];

    writeTextInstant(
        "TARGET SELECTED\n" +
        currentTarget.name + "\n" +
        currentTarget.ip
    );
}
function phish(args)
{
    if(!currentTarget)
    {
        writeTextInstant("no target selected");
        return;
    }

    trace += 10;

    let successChance = Math.random();

    if(successChance > 0.35)
    {
        let credentials = {
            user: "admin",
            pass: Math.random().toString(36).slice(2, 8)
        };

        let fileName = "creds_" + currentTarget.ip;

        system.files.push({
            name: fileName,
            type: "file",
            data: `USER: ${credentials.user}\nPASS: ${credentials.pass}`,
            protected: "no"
        });

        writeTextInstant(
            "PHISH SUCCESS\n" +
            "credentials saved to file: " + fileName
        );
    }
    else
    {
        trace += 15;
        writeTextInstant("PHISH FAILED\ntarget detected suspicious activity");
    }
}
        

function bruteForce(args){}
function InspectIP(){}
function user(args){
    if(args.length === 0)
    {
        writeTextInstant("current user: " + username);
        return;
    }

    username = args.join(" ");

    writeTextInstant("username set to: " + username);

}
function msg(args)
{
    if(args.length === 0)
    {
        writeTextInstant("type a message");
        return;
    }

    let text = args.join(" ");
    let fullMessage = `<${username}> ${text}`;

    socket.emit("msg", fullMessage);
}
function chat()
{
    writeTextInstant("chat is live (messages appear automatically)");
}
//wait function
function wait(seconds)
{
    let initialSeconds = seconds * 1000
    
    return new Promise(resolve => {
        setTimeout(resolve, initialSeconds)
    })
}


//write function "slowed"
async function writeText(text, seconds)
{
    let consoleText = document.getElementById("console")
    
    consoleText.innerText = "-"
    for(let i = 0; i < text.length; i++)
    {
        await wait(seconds)
        consoleText.innerText+= text[i]
    }
}

//write function "instant"
function writeTextInstant(text)
{
    let consoleText = document.getElementById("console")
    consoleText.innerText = "-"
    consoleText.innerText = text
}

//will probably be used only once
async function startIntro()
{
      let inputTextbox = document.getElementById("inputId1")
    inputTextbox.style.display = "none";
    
    let displayBox = document.getElementById("displayId1")
    
    let startText = "Initializing Terminal..."
    for(let i = 0; i < startText.length; i++)
    {
        await wait(0.1)
        displayBox.innerText += startText[i]
    }
    await wait(1)
    
    displayBox.innerText = displayBox.innerText.replace("...", "")
  
    inputTextbox.style.display = "inline"
    
    await writeText("hello.... welcome to MYconsole, a general-data driven terminal used for hacking", 0.1)
    await wait(1)
    displayBox.innerText = "MYconsole"
    
    //initializing the eventListen
    inputTextbox.addEventListener("keydown", handleInput)
    
    
}
startIntro()

//eventlister for Enter

function handleInput(event)
{
    if(event.key === "Enter")
    {
        event.preventDefault()
        readAndFunction()
    }
}
//getting input and text elements

 function readAndFunction()
{
    let inputField = document.getElementById("inputId1")
    let textField = document.getElementById("console")
    
    let user_Input = inputField.value.trim().toLowerCase();
    
    
    let parts = user_Input.split(/\s+/)
    let commandName = parts[0]
    
    let args = []
    let flags = []
    
    for(let i = 1; i < parts.length; i++)
    {
        if(parts[i].startsWith("-"))
        {
            flags.push(parts[i])
        }
        else
        {
            args.push(parts[i])
        }
    }
    
    if(commands[commandName])
    {
        commands[commandName](args, flags)
    }else
    {
        writeTextInstant("-<>UknownCommand<>")
    }
    inputField.value = ""
    
}

socket.on("msg", (data) => {
    let p = document.getElementById("console");

    p.innerText += "\n" + data;
});
