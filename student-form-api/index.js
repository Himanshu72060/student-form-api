const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const cors = require('cors');
const app = express();
const port = 3000;

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://student-form-api-default-rtdb.firebaseio.com" // Replace with your DB URL
});

const db = admin.database();
const ref = db.ref('students');

app.use(cors());
app.use(bodyParser.json());

// CREATE
app.post('/students', (req, res) => {
    const data = {
        ...req.body,
        date: new Date().toISOString()
    };
    const newRef = ref.push();
    newRef.set(data)
        .then(() => res.status(201).send({ id: newRef.key, ...data }))
        .catch(err => res.status(500).send(err));
});

// READ ALL
app.get('/students', async (req, res) => {
    ref.once('value', snapshot => {
        const data = snapshot.val() || {};
        res.send(data);
    }, error => res.status(500).send(error));
});

// READ ONE
app.get('/students/:id', (req, res) => {
    ref.child(req.params.id).once('value', snapshot => {
        if (snapshot.exists()) {
            res.send(snapshot.val());
        } else {
            res.status(404).send({ message: 'Student not found' });
        }
    });
});

// UPDATE
app.put('/students/:id', (req, res) => {
    ref.child(req.params.id).update(req.body)
        .then(() => res.send({ message: 'Updated successfully' }))
        .catch(err => res.status(500).send(err));
});

// DELETE
app.delete('/students/:id', (req, res) => {
    ref.child(req.params.id).remove()
        .then(() => res.send({ message: 'Deleted successfully' }))
        .catch(err => res.status(500).send(err));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
