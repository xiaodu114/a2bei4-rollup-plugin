document.addEventListener("DOMContentLoaded", () => {
    function fn1() {
        document.getElementById("showTime").innerHTML = new Date().toLocaleString();
    }
    fn1();
    setInterval(fn1, 1000);
});
