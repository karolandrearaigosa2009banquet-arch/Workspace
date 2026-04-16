usuario = "pepito@mail.com";
contraseña= "lamejorcontraseña123";

if (usuario == "") {
    console.log("usuario vacio");
}else if (contraseña.length < 8){
    console.log("contraseña demasiado corta");
}else{
    console.log("login exitoso");
}
