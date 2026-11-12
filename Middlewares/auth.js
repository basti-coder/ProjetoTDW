// Substitui a linha abaixo pelo teu modelo/tabela real de utilizadores (ex: Mongoose)
import User from '../Models/user.js';

async function autenticar(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
        res.setHeader('WWW-Authenticate', 'Basic');
        return res.status(401).json({ erro: "Não autorizado." });
    }

    try {
        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
        const [username, password] = credentials.split(':');

        const user = await User.findOne({ username: username });

        if (!user || user.password !== password) {
            res.setHeader('WWW-Authenticate', 'Basic');
            return res.status(401).json({ erro: "Não autorizado." });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({ erro: "Erro de servidor." });
    }
}

// Exportar no formato ES Modules
export default autenticar;