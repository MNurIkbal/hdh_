const pool = require("../config/database");

// Ensure table exists on first run
const ensureTableExists = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ai_chat_sessions (
                id VARCHAR(255) PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                conversation JSONB DEFAULT '[]'::jsonb,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    } catch (error) {
        console.error("Error creating ai_chat_sessions table:", error);
    }
};

ensureTableExists();

exports.getSessions = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            "SELECT id, title, updated_at FROM ai_chat_sessions WHERE user_id = $1 ORDER BY updated_at DESC",
            [userId]
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSessionById = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const result = await pool.query(
            "SELECT * FROM ai_chat_sessions WHERE id = $1 AND user_id = $2",
            [id, userId]
        );
        if (result.rows.length === 0) {
            return res.status(200).json({ success: true, data: null, message: "Sesi tidak ditemukan" });
        }
        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.saveSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id, title, conversation } = req.body;

        if (!id || !title || !conversation) {
            return res.status(400).json({ success: false, message: "id, title, dan conversation wajib diisi" });
        }

        const existing = await pool.query("SELECT id FROM ai_chat_sessions WHERE id = $1 AND user_id = $2", [id, userId]);

        if (existing.rows.length > 0) {
            await pool.query(
                "UPDATE ai_chat_sessions SET title = $1, conversation = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4",
                [title, JSON.stringify(conversation), id, userId]
            );
        } else {
            await pool.query(
                "INSERT INTO ai_chat_sessions (id, user_id, title, conversation) VALUES ($1, $2, $3, $4)",
                [id, userId, title, JSON.stringify(conversation)]
            );
        }

        res.status(200).json({ success: true, message: "Sesi berhasil disimpan" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        
        await pool.query("DELETE FROM ai_chat_sessions WHERE id = $1 AND user_id = $2", [id, userId]);
        
        res.status(200).json({ success: true, message: "Sesi berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
