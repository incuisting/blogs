import helloWebpack from './name'
import './index.css'
import './less.less'
import './sass.scss'
import google from './images/google.png'
document.querySelector('#root').innerHTML = helloWebpack
let img = new Image()
img.src = google
document.body.appendChild(img)
