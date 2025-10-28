import net from 'net'
import { FrameSockets } from './frameSocket'

const server = net.createServer((socket) => {
    socket.on('error', (dikkat) => {
        console.log(dikkat)
    })
    const frame  = new FrameSockets

    socket.write(frame.incomingBuffer(Buffer()))

})
