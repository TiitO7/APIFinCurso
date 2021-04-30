function authUser(req, res, next) {
    if (req.user == null) {
        res.status(403)
        return res.send('Necesitas iniciar sesión')
    }

    next()
}


function authRole(role) {
    return (req, res, next) => {
        if (res.user.role !== role) {
            res.status(401)
            return res.send("No estas autorizado")
        }

        next()
    }
}

function saveImage(dir, photo) {
    const data = photo.split(',')[1] || photo;
    const file = `${Date.now()}.jpg`;
    return (resolve, reject) => {
        const filePath = 'img' + dir + file;
        fs.writeFile(filePath, data, { encoding: 'base64' }, (err) => {
            if (err) { reject(err); }
            resolve(`img/${dir}/${file}`);
        });
    }
}

function generateUrl(imagen, req) {
    return 'http://' + req.headers.host + '/public/uploads/' + imagen;
}

module.exports = {
    authUser,
    authRole,
    saveImage,
    generateUrl
}