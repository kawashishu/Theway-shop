const pool = require('./config/dbconnect')

exports.getChat = pool.query(
        `SELECT users.name as name,chat.content, ROUND(CAST(EXTRACT(epoch FROM age(chat.create_date))/3600 AS NUMERIC),2) as time 
        FROM chat, users 
        WHERE mess_type = 'message' 
        AND users.id = chat.user_id 
        ORDER BY create_date DESC 
        LIMIT 5;`
    )
 