//ESM module
//CJS module
import {createServer} from 'http';

const server = createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('Hello Node!');
    res.end();
});

server.listen(3000, ()=>{
    console.log('Server is running on port 3000');
});