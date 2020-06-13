# scraping-dgt
If you suddenly need to prepare for the theoretical exam for obtaining rights in Spain, you can use this scraper to get tickets with answers and pictures.The response number corresponds to the element number of the response array (0,1,2)
  ```shell
  $ [{"question":"For a driver, sleep causes ...",
      "answers":[
        "Reduced reaction time.",
        "More dangerous behaviour.",
        "Better perception of surrounding traffic conditions."],
     "tryAncwer":"1",
     "imgLinc":"https://sedeapl.dgt.gob.es/WEB_EXAM_AUTO/ServletImagen?nameImagen=/IMAGENES/09_MANIOBRAS/ESTACIONAMIENTO/FOTO1765.jpg"},
     .....
     ]
  ```
 
 ```shell
  $ node index.js
  ```
