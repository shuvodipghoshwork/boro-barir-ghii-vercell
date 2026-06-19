const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// API Routes
app.post('/api/orders', async (req, res) => {
    const { name, phone, address, state, postal_code, note, quantity, delivery_charge, total_price } = req.body;
    
    if (!name || !phone || !address || !state || !postal_code || !quantity || !total_price) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const charge = delivery_charge || 150;
    
    try {
        const { data, error } = await supabase
            .from('orders')
            .insert([{
                name,
                phone,
                address,
                state,
                postal_code,
                note,
                quantity: parseInt(quantity),
                delivery_charge: parseInt(charge),
                total_price: parseInt(total_price)
            }])
            .select('id')
            .single();

        if (error) {
            console.error("Supabase insert error:", error);
            return res.status(500).json({ error: error.message });
        }

        res.json({ id: data.id, message: "Order created successfully" });
    } catch (err) {
        console.error("Unexpected insert error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Supabase fetch error:", error);
            return res.status(500).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        console.error("Unexpected fetch error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/orders/:id/status', async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    try {
        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id)
            .select();

        if (error) {
            console.error("Supabase update error:", error);
            return res.status(500).json({ error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.json({ message: "Order status updated successfully" });
    } catch (err) {
        console.error("Unexpected update error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Admin Route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Admin Route
app.get('/order', (req, res) => {
    res.sendFile(path.join(__dirname, 'order.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
