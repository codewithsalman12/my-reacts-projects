const ll= document.querySelector("#cardmain")
fetch('Data.json').then((res)=>{
    return res.json()
}).then((result)=>{
    result.map((e)=>{
        return ll.innerHTML+=`<div class="card" id="l1">
                <div class="card-image-container">
                    <img src="${e.image}" alt="Dell Inspiron 15">
                </div>
                <div class="card-content">
                    <h2>${e.name}</h2>
                    <ul>
                        <li><strong>Price:</strong>${e.price}</li>
                        <li><strong>RAM:</strong>${e.ram}</li>
                        <li><strong>OS:</strong>${e.os}</li>
                    </ul>
                    <a href="#" class="btn">View Deal</a>
                </div>
            </div>`
    })
})