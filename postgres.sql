CREATE EXTENSION pgcrypto;

CREATE OR REPLACE FUNCTION generate_uid(size INT) RETURNS TEXT AS $$
DECLARE
  characters TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  bytes BYTEA := gen_random_bytes(size);
  l INT := length(characters);
  i INT := 0;
  output TEXT := '';
BEGIN
  WHILE i < size LOOP
    output := output || substr(characters, get_byte(bytes, i) % l + 1, 1);
    i := i + 1;
  END LOOP;
  RETURN output;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE TABLE manager(
    id TEXT PRIMARY KEY DEFAULT generate_uid(15),
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fullname VARCHAR(255),
    birthday VARCHAR(255),
    salary DECIMAL(12,00),
    image VARCHAR(255)
);

CREATE TABLE users(
    id TEXT PRIMARY KEY DEFAULT generate_uid(15),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    birthday DATE NOT NULL,
    address VARCHAR(255) NOT NULL,
    balance DECIMAL(12,2) DEFAULT 0 ,
    is_delete BOOLEAN DEFAULT false,
    verified BOOLEAN DEFAULT false,
    image VARCHAR(255)
);

CREATE TABLE tag(
    id serial PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);
CREATE TABLE category(
    id serial PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);
CREATE TABLE tag_category(
    tag_id INT NOT NULL,
    category_id INT NOT NULL,

    CONSTRAINT fk_tagCate_cateid
        FOREIGN KEY (category_id)
            REFERENCES category(id)
            ON DELETE CASCADE,

    CONSTRAINT fk_tagCate_tagid
    FOREIGN KEY (tag_id)
        REFERENCES tag(id)
        ON DELETE CASCADE
);
CREATE TABLE product(
    id TEXT PRIMARY KEY DEFAULT generate_uid(15),
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    price DECIMAL(12,2) NOT NULL,
    brand VARCHAR(255),
    tag_id int,
    available INT,
    sold INT,
    is_delete BOOLEAN DEFAULT false,
    image VARCHAR(255),
    state VARCHAR(10) DEFAULT 'new',
    create_date TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_product_tagid
        FOREIGN KEY (tag_id)
            REFERENCES tag(id)
            ON DELETE SET NULL
);

CREATE TABLE product_image(
    product_id TEXT NOT NULL,
    image VARCHAR(255) NOT NULL,

    CONSTRAINT fk_product_image_productid
        FOREIGN KEY (product_id)
            REFERENCES product(id)
            ON DELETE CASCADE
);

CREATE TABLE rating(
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    star int NOT NULL,
    content VARCHAR(255) NOT NULL,
    create_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_rating_userid
        FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE,
        
    CONSTRAINT fk_rating_productid
        FOREIGN KEY (product_id) 
            REFERENCES product(id)
            ON DELETE CASCADE
);

CREATE TABLE wishlist(
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,

    CONSTRAINT fk_wish_userid
        FOREIGN KEY (user_id) 
            REFERENCES users(id)
            ON DELETE CASCADE,
    
    CONSTRAINT fk_wish_productid
        FOREIGN KEY (product_id) 
            REFERENCES product(id)
            ON DELETE CASCADE
);

CREATE TABLE cart(
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INT DEFAULT 1,

    CONSTRAINT fk_cart_userid
        FOREIGN KEY (user_id) 
            REFERENCES users(id) 
            ON DELETE CASCADE,
    
    CONSTRAINT fk_cart_productid
        FOREIGN KEY (product_id) 
            REFERENCES product(id)
            ON DELETE CASCADE
);

CREATE TABLE orders(
    id TEXT PRIMARY KEY DEFAULT generate_uid(15),
    user_id TEXT NOT NULL,
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    detail_address VARCHAR(255) NOT NULL,
    payment VARCHAR(255) NOT NULL,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    state INT DEFAULT 0,
    cancel BOOLEAN DEFAULT false, 
    create_date TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_order_userid
        FOREIGN KEY (user_id) 
            REFERENCES users(id) 
            ON DELETE CASCADE
);

CREATE TABLE order_product(
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INT DEFAULT 1,

    CONSTRAINT fk_orderpro_orderid
        FOREIGN KEY (order_id)
            REFERENCES orders(id)
            ON DELETE CASCADE, 

    CONSTRAINT fk_orderpro_proid
        FOREIGN KEY (product_id)
            REFERENCES product(id)
            ON DELETE CASCADE

);

CREATE TABLE chat(
    user_id TEXT NOT NULL,
    content VARCHAR(255),
    mess_type TEXT NOT NULL,
    create_date TIMESTAMP DEFAULT transaction_timestamp(),

    CONSTRAINT fk_chat_userid
        FOREIGN KEY (user_id) 
            REFERENCES users(id)
            ON DELETE CASCADE
);

CREATE TABLE comment(
    product_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    content VARCHAR(255),
    create_date TIMESTAMP DEFAULT transaction_timestamp(),

    CONSTRAINT fk_comment_proid
        FOREIGN KEY (product_id) 
            REFERENCES product(id)
            ON DELETE CASCADE
);

CREATE TABLE visit(
    _month INT NOT NULL,
    _year INT NOT NULL,
    _count INT NOT NULL
);

CREATE TABLE order_state(
    id INT PRIMARY KEY,
    description VARCHAR(20) NOT NULL
);

CREATE TABLE cache_action(
    name TEXT NOT NULL,
    action BOOLEAN DEFAULT false
);
INSERT INTO cache_action(name) VALUES ('clear');
ALTER TABLE wishlist ADD CONSTRAINT wishlist_unique UNIQUE (user_id,product_id);
ALTER TABLE cart ADD CONSTRAINT cart_unique UNIQUE (user_id,product_id);
ALTER TABLE orders ADD CONSTRAINT fk_order_state FOREIGN KEY (state) REFERENCES order_state(id) ON DELETE SET NULL;
-- Update avi/sold on product each insret on order_product
CREATE OR REPLACE FUNCTION function_update_sold_order() RETURNS TRIGGER AS
$BODY$
BEGIN
    UPDATE product 
    SET available = product.available - new.quantity, sold = product.sold + new.quantity
    WHERE id = new.product_id;

    UPDATE orders
    SET total = total + cacu.cacu_value
    FROM  (SELECT (new.quantity*price) as cacu_value
            FROM product 
            WHERE product.id = new.product_id) as cacu
    WHERE orders.id = new.order_id;
           RETURN new;
END;
$BODY$
language plpgsql;

CREATE TRIGGER trig_copy
     AFTER INSERT ON order_product
     FOR EACH ROW
     EXECUTE PROCEDURE function_update_sold_order();
-- clear cart and insert to order_product
CREATE OR REPLACE FUNCTION function_checkout_order() RETURNS TRIGGER AS
$BODY$
BEGIN
    INSERT INTO order_product(order_id , product_id, quantity)
    SELECT new.id, product_id, quantity
    FROM cart
    WHERE user_id = new.user_id;
    
    UPDATE product SET state = 'top' WHERE sold >=10;

    DELETE FROM cart WHERE user_id = new.user_id;
    RETURN new;

    UPDATE orders SET total = total*1.02 WHERE id=new.id;
END;
$BODY$
language plpgsql;

CREATE TRIGGER trig_checkout
     AFTER INSERT ON orders
     FOR EACH ROW
     EXECUTE PROCEDURE function_checkout_order();

--restore porduct on cancel order
CREATE OR REPLACE FUNCTION function_order_cancel() RETURNS TRIGGER AS
$BODY$
declare
    r record;
BEGIN
    FOR r IN SELECT * FROM order_product WHERE order_id = new.id
    LOOP 
    UPDATE product 
    SET available = product.available + r.quantity, sold = product.sold - r.quantity
    WHERE id = r.product_id;
    END LOOP;
    UPDATE orders SET total=0 WHERE id=new.id;
    RETURN new;
END;
$BODY$
language plpgsql;

CREATE TRIGGER trig_order_cancel
     AFTER UPDATE OF cancel ON orders
     FOR EACH ROW
     EXECUTE PROCEDURE function_order_cancel();

INSERT INTO order_state(id,description)
VALUES (0,'Verify'),(1,'Delivering'),(2,'Delivered');

INSERT INTO manager(username,password,fullname,birthday,salary,image)
VALUES ('phuoc','$2b$10$h5FmpOByBiMj95UM76ODH.BvJ8uRMkUjET1Q9fR92DdYSXrPF2ir2','Phuoc Nguyen','2001-03-19',1000.00,'https://i.ibb.co/LZ0zJpx/384e4065ba2a.jpg'),
('phuong','$2b$10$h5FmpOByBiMj95UM76ODH.BvJ8uRMkUjET1Q9fR92DdYSXrPF2ir2','Phuong Nguyen','2001-03-11',1000.00,'https://i.ibb.co/fQrnZqj/8b8815604d08.png'),
('nguyen','$2b$10$h5FmpOByBiMj95UM76ODH.BvJ8uRMkUjET1Q9fR92DdYSXrPF2ir2','Nguyen Doan','2001-03-10',1000.00,'https://i.ibb.co/fQrnZqj/8b8815604d08.png');

INSERT INTO users(name,email,password,birthday,address,image,verified)
VALUES ('Phuoc Nguyen','phuoc@gmail.com','$2b$10$h5FmpOByBiMj95UM76ODH.BvJ8uRMkUjET1Q9fR92DdYSXrPF2ir2','2001-03-19','Chu Pah, Gia Lai, Viet Nam','https://i.ibb.co/LZ0zJpx/384e4065ba2a.jpg',true),
('Phuong Nguyen','phuong@gmail.com','$2b$10$h5FmpOByBiMj95UM76ODH.BvJ8uRMkUjET1Q9fR92DdYSXrPF2ir2','2001-03-11',' Binh Phuoc, Viet Nam','https://i.ibb.co/j6vw70j/38b3bc07a1e1.jpg',true),
('Nguyen Doan','nguyen@gmail.com','$2b$10$h5FmpOByBiMj95UM76ODH.BvJ8uRMkUjET1Q9fR92DdYSXrPF2ir2','2001-03-10','Pleiku, Gia Lai, Viet Nam','https://i.ibb.co/1QYxgjt/b09aaebb7116.jpg',true),
('User 1','user1@gmail.com','$2b$10$h5FmpOByBiMj95UM76ODH.BvJ8uRMkUjET1Q9fR92DdYSXrPF2ir2','2001-03-19','Chu Pah, Gia Lai, Viet Nam','',true),
('User 2','user2@gmail.com','$2b$10$h5FmpOByBiMj95UM76ODH.BvJ8uRMkUjET1Q9fR92DdYSXrPF2ir2','2001-03-11',' Binh Phuoc, Viet Nam','',true),
('User 3','user3@gmail.com','$2b$10$h5FmpOByBiMj95UM76ODH.BvJ8uRMkUjET1Q9fR92DdYSXrPF2ir2','2001-03-10','Pleiku, Gia Lai, Viet Nam','',true),
('User 4','user4@gmail.com','$2b$10$h5FmpOByBiMj95UM76ODH.BvJ8uRMkUjET1Q9fR92DdYSXrPF2ir2','2001-03-19','Chu Pah, Gia Lai, Viet Nam','',true),
('User 5','user5@gmail.com','$2b$10$h5FmpOByBiMj95UM76ODH.BvJ8uRMkUjET1Q9fR92DdYSXrPF2ir2','2001-03-11',' Binh Phuoc, Viet Nam','',true),
('User 6','user6@gmail.com','$2b$10$h5FmpOByBiMj95UM76ODH.BvJ8uRMkUjET1Q9fR92DdYSXrPF2ir2','2001-03-10','Pleiku, Gia Lai, Viet Nam','',true),
('User 7','user7@gmail.com','$2b$10$h5FmpOByBiMj95UM76ODH.BvJ8uRMkUjET1Q9fR92DdYSXrPF2ir2','2001-03-19','Chu Pah, Gia Lai, Viet Nam','',true),
('User 8','user8@gmail.com','$2b$10$h5FmpOByBiMj95UM76ODH.BvJ8uRMkUjET1Q9fR92DdYSXrPF2ir2','2001-03-11',' Binh Phuoc, Viet Nam','',true),
('User 9','user9@gmail.com','$2b$10$h5FmpOByBiMj95UM76ODH.BvJ8uRMkUjET1Q9fR92DdYSXrPF2ir2','2001-03-10','Pleiku, Gia Lai, Viet Nam','',true);

INSERT INTO tag(name)
VALUES ('Shirts'),('Jean'),('Shoes'),('Bag'),('T-Shirts'),('Sweaters'),('Swimware'),('Trousers'),('Sunglasses'),('Walets'),('Watchs'),('Suits');

INSERT INTO category(name)
VALUES ('Top'),('Bottom'),('Clothing'),('Accessories');

INSERT INTO tag_category(tag_id,category_id)
VALUES (1,1),(1,3),(2,2),(2,3),(3,2),(4,4),(5,1),(5,3),(6,1),(7,2),(8,2),(9,4),(10,4),(11,4),(12,3);

INSERT INTO product(title, description, price, image, brand, tag_id, available, sold)
VALUES 
('Slim Leather Watch','Nam sagittis a augue eget scelerisque. Nullam lacinia consectetur sagittis. Nam sed neque id eros fermentum dignissim quis at tortor.',999.99,'https://i.ibb.co/hc5QZyY/slim.jpg','ABC',11,100,0);
INSERT INTO product(title, description, price, image, brand, tag_id, available, sold)
VALUES 
('One + Watch','Nam sagittis a augue eget scelerisque. Nullam lacinia consectetur sagittis. Nam sed neque id eros fermentum dignissim quis at tortor.',99.99,'https://i.ibb.co/NpTFtDg/onepls.png','ABC',11,100,0);
INSERT INTO product(title, description, price, image, brand, tag_id, available, sold)
VALUES 
('Huawei Smart Watch','Nam sagittis a augue eget scelerisque. Nullam lacinia consectetur sagittis. Nam sed neque id eros fermentum dignissim quis at tortor.',999.99,'https://i.ibb.co/h2psngQ/huawei.png','ABC',11,100,0);
INSERT INTO product(title, description, price, image, brand, tag_id, available, sold)
VALUES 
('Shirts','kaki, comfortable',9.99,'https://i.ibb.co/LNrBbpZ/shirt-img.jpg','Local',1,200,0);
INSERT INTO product(title, description, price, image, brand, tag_id, available, sold)
VALUES 
('Jean','Made from kaki, super comfortable, model and stylist',19.99,'https://i.ibb.co/bgccpjM/jean.jpg','Local',2,1000,0);
INSERT INTO product(title, description, price, image, brand, tag_id, available, sold)
VALUES 
('Men Shoes','Stylist men shoes, super super comfotable',99.99,'https://i.ibb.co/pd0nW3b/shoes-img.jpg','Hush Puppies',3,500,0);
INSERT INTO product(title, description, price, image, brand, tag_id, available, sold)
VALUES 
('Sliver Modern Watch','Nam sagittis a augue eget scelerisque. Nullam lacinia consectetur sagittis. Nam sed neque id eros fermentum dignissim quis at tortor.',499.99,'https://i.ibb.co/mqRQfH3/img-pro-04.jpg','Tiffany & Co',4,100,0);
INSERT INTO product(title, description, price, image, brand, tag_id, available, sold)
VALUES 
('Walet','Nam sagittis a augue eget scelerisque. Nullam lacinia consectetur sagittis. Nam sed neque id eros fermentum dignissim quis at tortor.',49.99,'https://i.ibb.co/7JDFRLD/wallet-img.jpg','Abc',10,100,0);
INSERT INTO product(title, description, price, image, brand, tag_id, available, sold)
VALUES 
('T-Shirts black & orange','Nam sagittis a augue eget scelerisque. Nullam lacinia consectetur sagittis. Nam sed neque id eros fermentum dignissim quis at tortor.',79.99,'https://i.ibb.co/J5RyXN7/t-shirts-img.jpg','DEF',5,100,0);
INSERT INTO product(title, description, price, image, brand, tag_id, available, sold)
VALUES 
('Brown Bag','Nam sagittis a augue eget scelerisque. Nullam lacinia consectetur sagittis. Nam sed neque id eros fermentum dignissim quis at tortor.',99.99,'https://i.ibb.co/09Qb0W8/women-bag-img.jpg','DEF',4,100,0);
INSERT INTO product(title, description, price, image, brand, tag_id, available, sold)
VALUES 
('Healthy Bag','Nam sagittis a augue eget scelerisque. Nullam lacinia consectetur sagittis. Nam sed neque id eros fermentum dignissim quis at tortor.',499.99,'https://i.ibb.co/mF1yrX5/instagram-img-04.jpg','Tiffany & Co',11,100,0);
INSERT INTO product(title, description, price, image, brand, tag_id, available, sold)
VALUES 
('Weding Suit','Nam sagittis a augue eget scelerisque. Nullam lacinia consectetur sagittis. Nam sed neque id eros fermentum dignissim quis at tortor.',49.99,'https://i.ibb.co/YWMW68J/suit.jpg','Abc',12,100,0);
INSERT INTO product(title, description, price, image, brand, tag_id, available, sold)
VALUES 
('Modern Sunglass','Nam sagittis a augue eget scelerisque. Nullam lacinia consectetur sagittis. Nam sed neque id eros fermentum dignissim quis at tortor.',79.99,'https://i.ibb.co/LgBzcw6/sunglass.jpg','ABC',9,100,0);
INSERT INTO product(title, description, price, image, brand, tag_id, available, sold)
VALUES 
('Golden Watch','Nam sagittis a augue eget scelerisque. Nullam lacinia consectetur sagittis. Nam sed neque id eros fermentum dignissim quis at tortor.',59.99,'https://i.ibb.co/mF1yrX5/instagram-img-08.jpg','DEF',11,100,0);
INSERT INTO product(title, description, price, image, brand, tag_id, available, sold)
VALUES 
('Rolex Watch','Nam sagittis a augue eget scelerisque. Nullam lacinia consectetur sagittis. Nam sed neque id eros fermentum dignissim quis at tortor.',999.99,'https://i.ibb.co/crqPHJZ/rolex.jpg','Rolex',11,100,0);
INSERT INTO product(title, description, price, image, brand, tag_id, available, sold)
VALUES 
('Black Bracelets Watch','Nam sagittis a augue eget scelerisque. Nullam lacinia consectetur sagittis. Nam sed neque id eros fermentum dignissim quis at tortor.',99.99,'https://i.ibb.co/SR0TnMS/celine.png','Celine',11,100,0);
INSERT INTO product(title, description, price, image, brand, tag_id, available, sold)
VALUES 
('Oppo Smart Watch','Nam sagittis a augue eget scelerisque. Nullam lacinia consectetur sagittis. Nam sed neque id eros fermentum dignissim quis at tortor.',999.99,'https://i.ibb.co/6trTSTw/oppo.jpg','ABC',11,100,0);
INSERT INTO product(title, description, price, image, brand, tag_id, available, sold)
VALUES 
('Pretty Sweater','Nam sagittis a augue eget scelerisque. Nullam lacinia consectetur sagittis. Nam sed neque id eros fermentum dignissim quis at tortor.',9999.99,'https://i.ibb.co/wJKsnGq/sweater.jpg','DEF',6,100,0);
INSERT INTO product(title, description, price, image, brand, tag_id, available, sold)
VALUES 
('Black One Piece','Nam sagittis a augue eget scelerisque. Nullam lacinia consectetur sagittis. Nam sed neque id eros fermentum dignissim quis at tortor.',19999.99,'https://i.ibb.co/XV3DhP5/swimsuit.jpg','ABC',7,100,0);
INSERT INTO product(title, description, price, image, brand, tag_id, available, sold)
VALUES 
('Apple Watch','Nam sagittis a augue eget scelerisque. Nullam lacinia consectetur sagittis. Nam sed neque id eros fermentum dignissim quis at tortor.',9999.99,'https://i.ibb.co/Q9wJtbL/98f049fdb177.jpg','DEF',11,100,0);
INSERT INTO product(title, description, price, image, brand, tag_id, available, sold)
VALUES 
('Korean Style Pant','Nam sagittis a augue eget scelerisque. Nullam lacinia consectetur sagittis. Nam sed neque id eros fermentum dignissim quis at tortor.',1.99,'https://i.ibb.co/Gt6zYdB/02233d99b81c.jpg','ABC',8,100,0);

INSERT INTO product_image(product_id,image)
VALUES ((SELECT id FROM product WHERE title='Pretty Sweater'), 'https://i.ibb.co/pQNB3nb/sweater1.jpg'),
((SELECT id FROM product WHERE title='Pretty Sweater'), 'https://i.ibb.co/GpLqfPQ/sweater2.jpg'),
((SELECT id FROM product WHERE title='Black One Piece'), 'https://i.ibb.co/WsR6dR5/swimware2.jpg'),
((SELECT id FROM product WHERE title='Black One Piece'), 'https://i.ibb.co/CHRnVYv/2853973acae7.jpg'),
((SELECT id FROM product WHERE title='Apple Watch'), 'https://i.ibb.co/gVfSs8P/apwatch1.jpg'),
((SELECT id FROM product WHERE title='Apple Watch'), 'https://i.ibb.co/Ht6S49J/apwatch2.jpg'),
((SELECT id FROM product WHERE title='Korean Style Pant'), 'https://i.ibb.co/thgvfJX/5eb9ac054f3d.jpg'),
((SELECT id FROM product WHERE title='Korean Style Pant'), 'https://i.ibb.co/CQ5zZGJ/094f25475c54.jpg');

INSERT INTO wishlist(user_id,product_id)
VALUES ((SELECT id FROM users WHERE name='Phuoc Nguyen'),(SELECT id FROM product WHERE title='Pretty Sweater'));
INSERT INTO wishlist(user_id,product_id)
VALUES
((SELECT id FROM users WHERE name='Phuoc Nguyen'),(SELECT id FROM product WHERE title='Black One Piece'));
INSERT INTO wishlist(user_id,product_id)
VALUES
((SELECT id FROM users WHERE name='Phuoc Nguyen'),(SELECT id FROM product WHERE title='Apple Watch'));
INSERT INTO wishlist(user_id,product_id)
VALUES
((SELECT id FROM users WHERE name='Phuoc Nguyen'),(SELECT id FROM product WHERE title='Korean Style Pant'));
INSERT INTO wishlist(user_id,product_id)
VALUES
((SELECT id FROM users WHERE name='Phuong Nguyen'),(SELECT id FROM product WHERE title='Rolex Watch'));
INSERT INTO wishlist(user_id,product_id)
VALUES
((SELECT id FROM users WHERE name='Phuong Nguyen'),(SELECT id FROM product WHERE title='Black One Piece'));
INSERT INTO wishlist(user_id,product_id)
VALUES
((SELECT id FROM users WHERE name='Phuong Nguyen'),(SELECT id FROM product WHERE title='Oppo Smart Watch'));


INSERT INTO cart(user_id,product_id, quantity)
VALUES ((SELECT id FROM users WHERE name='Phuoc Nguyen'),(SELECT id FROM product WHERE title='Pretty Sweater'),2),
((SELECT id FROM users WHERE name='Phuoc Nguyen'),(SELECT id FROM product WHERE title='Apple Watch'),2),
((SELECT id FROM users WHERE name='Phuoc Nguyen'),(SELECT id FROM product WHERE title='Weding Suit'),1),
((SELECT id FROM users WHERE name='Phuong Nguyen'),(SELECT id FROM product WHERE title='Rolex Watch'),1),
((SELECT id FROM users WHERE name='Phuong Nguyen'),(SELECT id FROM product WHERE title='Weding Suit'),2);

INSERT INTO orders(user_id,fullname, email, address, detail_address,payment)
VALUES ((SELECT id FROM users WHERE name='Phuoc Nguyen'),'Phước Nguyễn', 'phuoc@gmail.com','Gia Lai, Việt Nam', 'Thôn 9, Nghĩa Hưng, Chư Păh','credit card');
INSERT INTO orders(user_id,fullname, email, address, detail_address,payment)
VALUES
((SELECT id FROM users WHERE name='Phuong Nguyen'),'Phương Nguyễn', 'phuong@gmail.com','Tokyo, Japan','Shimotsuki, East Blue','cash');
INSERT INTO orders(user_id,fullname, email, address, detail_address,payment)
VALUES
((SELECT id FROM users WHERE name='Nguyen Doan'),'Nguyên Đoàn','nguyen@gmail.com','Tokyo, Japan','Shimotsuki,East Blue','cash');
INSERT INTO orders(user_id,fullname, email, address, detail_address,payment)
VALUES
((SELECT id FROM users WHERE name='Nguyen Doan'),'Nguyên Đoàn','nguyen@gmail.com','Gia Lai, Việt Nam','Lê Duẩn, Phù Đổng, Pleiku', 'Paypal');
INSERT INTO orders(user_id,fullname, email, address, detail_address,payment)
VALUES
((SELECT id FROM users WHERE name='Phuoc Nguyen'),'Phước Nguyễn', 'phuoc@gmail.com','Gia Lai, Việt Nam', 'Thôn 9, Nghĩa Hưng, Chư Păh','credit card');
INSERT INTO orders(user_id,fullname, email, address, detail_address,payment)
VALUES
((SELECT id FROM users WHERE name='Phuong Nguyen'),'Phương Nguyễn', 'phuong@gmail.com','Tokyo, Japan','Shimotsuki, East Blue','cash');
INSERT INTO orders(user_id,fullname, email, address, detail_address,payment)
VALUES
((SELECT id FROM users WHERE name='Nguyen Doan'),'Nguyên Đoàn','nguyen@gmail.com','Tokyo, Japan','Shimotsuki,East Blue','cash');
INSERT INTO orders(user_id,fullname, email, address, detail_address,payment)
VALUES
((SELECT id FROM users WHERE name='Nguyen Doan'),'Nguyên Đoàn','nguyen@gmail.com','Gia Lai, Việt Nam','Lê Duẩn, Phù Đổng, Pleiku', 'Paypal');
INSERT INTO orders(user_id,fullname, email, address, detail_address,payment)
VALUES
((SELECT id FROM users WHERE name='Phuoc Nguyen'),'Phước Nguyễn', 'phuoc@gmail.com','Gia Lai, Việt Nam', 'Thôn 9, Nghĩa Hưng, Chư Păh','credit card');
INSERT INTO orders(user_id,fullname, email, address, detail_address,payment)
VALUES
((SELECT id FROM users WHERE name='Phuong Nguyen'),'Phương Nguyễn', 'phuong@gmail.com','Tokyo, Japan','Shimotsuki, East Blue','cash');
INSERT INTO orders(user_id,fullname, email, address, detail_address,payment)
VALUES
((SELECT id FROM users WHERE name='Phuong Nguyen'),'Phương Nguyễn','phuong@gmail.com','Tokyo, Japan','Shimotsuki,East Blue','cash');
INSERT INTO orders(user_id,fullname, email, address, detail_address,payment)
VALUES
((SELECT id FROM users WHERE name='Nguyen Doan'),'Nguyên Đoàn','nguyen@gmail.com','Gia Lai, Việt Nam','Lê Duẩn, Phù Đổng, Pleiku', 'Paypal');
INSERT INTO orders(user_id,fullname, email, address, detail_address,payment)
VALUES
((SELECT id FROM users WHERE name='Phuoc Nguyen'),'Phước Nguyễn', 'phuoc@gmail.com','Gia Lai, Việt Nam', 'Thôn 9, Nghĩa Hưng, Chư Păh','credit card');
INSERT INTO orders(user_id,fullname, email, address, detail_address,payment)
VALUES
((SELECT id FROM users WHERE name='Phuong Nguyen'),'Phương Nguyễn', 'phuong@gmail.com','Tokyo, Japan','Shimotsuki, East Blue','cash');
INSERT INTO orders(user_id,fullname, email, address, detail_address,payment)
VALUES
((SELECT id FROM users WHERE name='Phuong Nguyen'),'Phương Nguyễn','phuong@gmail.com','Tokyo, Japan','Shimotsuki,East Blue','cash');
INSERT INTO orders(user_id,fullname, email, address, detail_address,payment)
VALUES
((SELECT id FROM users WHERE name='Nguyen Doan'),'Nguyên Đoàn','nguyen@gmail.com','Gia Lai, Việt Nam','Lê Duẩn, Phù Đổng, Pleiku', 'Paypal');

INSERT INTO order_product(order_id,product_id,quantity)
VALUES 
((SELECT id FROM orders ORDER BY id LIMIT 1 OFFSET 1),(SELECT id FROM product WHERE title='Pretty Sweater'),2),
((SELECT id FROM orders ORDER BY id LIMIT 1 OFFSET 1),(SELECT id FROM product WHERE title='Black One Piece'),1),
((SELECT id FROM orders ORDER BY id LIMIT 1 OFFSET 1),(SELECT id FROM product WHERE title='Korean Style Pant'),2),
((SELECT id FROM orders ORDER BY id LIMIT 1 OFFSET 1),(SELECT id FROM product WHERE title='Apple Watch'),1),
((SELECT id FROM orders ORDER BY id LIMIT 1 OFFSET 2),(SELECT id FROM product WHERE title='Pretty Sweater'),2),
((SELECT id FROM orders ORDER BY id LIMIT 1 OFFSET 2),(SELECT id FROM product WHERE title='One + Watch'),2),
((SELECT id FROM orders ORDER BY id LIMIT 1 OFFSET 2),(SELECT id FROM product WHERE title='Modern Sunglass'),2),
((SELECT id FROM orders ORDER BY id LIMIT 1 OFFSET 2),(SELECT id FROM product WHERE title='Apple Watch'),1),
((SELECT id FROM orders ORDER BY id LIMIT 1 OFFSET 3),(SELECT id FROM product WHERE title='Pretty Sweater'),2),
((SELECT id FROM orders ORDER BY id LIMIT 1 OFFSET 3),(SELECT id FROM product WHERE title='Korean Style Pant'),2),
((SELECT id FROM orders ORDER BY id LIMIT 1 OFFSET 3),(SELECT id FROM product WHERE title='Modern Sunglass'),2),
((SELECT id FROM orders ORDER BY id LIMIT 1 OFFSET 3),(SELECT id FROM product WHERE title='Oppo Smart Watch'),1),
((SELECT id FROM orders ORDER BY id LIMIT 1 OFFSET 4),(SELECT id FROM product WHERE title='Pretty Sweater'),2),
((SELECT id FROM orders ORDER BY id LIMIT 1 OFFSET 4),(SELECT id FROM product WHERE title='Black One Piece'),1),
((SELECT id FROM orders ORDER BY id LIMIT 1 OFFSET 5),(SELECT id FROM product WHERE title='Apple Watch'),1),
((SELECT id FROM orders ORDER BY id LIMIT 1 OFFSET 5),(SELECT id FROM product WHERE title='Healthy Bag'),2),
((SELECT id FROM orders ORDER BY id LIMIT 1 OFFSET 6),(SELECT id FROM product WHERE title='Modern Sunglass'),2),
((SELECT id FROM orders ORDER BY id LIMIT 1 OFFSET 6),(SELECT id FROM product WHERE title='Weding Suit'),1),
((SELECT id FROM orders ORDER BY id LIMIT 1 OFFSET 7),(SELECT id FROM product WHERE title='Pretty Sweater'),2),
((SELECT id FROM orders ORDER BY id LIMIT 1 OFFSET 7),(SELECT id FROM product WHERE title='Healthy Bag'),2),
((SELECT id FROM orders ORDER BY id LIMIT 1 OFFSET 8),(SELECT id FROM product WHERE title='Modern Sunglass'),2),
((SELECT id FROM orders ORDER BY id LIMIT 1 OFFSET 8),(SELECT id FROM product WHERE title='Oppo Smart Watch'),1),
((SELECT id FROM orders ORDER BY id LIMIT 1 OFFSET 9),(SELECT id FROM product WHERE title='Pretty Sweater'),2),
((SELECT id FROM orders ORDER BY id LIMIT 1 OFFSET 10),(SELECT id FROM product WHERE title='Walet'),1),
((SELECT id FROM orders ORDER BY id LIMIT 1 OFFSET 11),(SELECT id FROM product WHERE title='Modern Sunglass'),2),
((SELECT id FROM orders ORDER BY id LIMIT 1 OFFSET 12),(SELECT id FROM product WHERE title='Healthy Bag'),1),
((SELECT id FROM orders ORDER BY id LIMIT 1 OFFSET 13),(SELECT id FROM product WHERE title='Modern Sunglass'),2),
((SELECT id FROM orders ORDER BY id LIMIT 1 OFFSET 14),(SELECT id FROM product WHERE title='Oppo Smart Watch'),1),
((SELECT id FROM orders ORDER BY id LIMIT 1 OFFSET 15),(SELECT id FROM product WHERE title='Shirts'),1),
((SELECT id FROM orders ORDER BY id LIMIT 1 OFFSET 0),(SELECT id FROM product WHERE title='Korean Style Pant'),2);

INSERT INTO chat(user_id,content,mess_type)
VALUES ((SELECT id FROM users WHERE name='Phuoc Nguyen'),'Where r my goods','message');
INSERT INTO chat(user_id,content,mess_type)
VALUES
((SELECT id FROM users WHERE name='Phuoc Nguyen'),'It is on the way','reply');
INSERT INTO chat(user_id,content,mess_type)
VALUES
((SELECT id FROM users WHERE name='Phuong Nguyen'),'Do we have sword','message');
INSERT INTO chat(user_id,content,mess_type)
VALUES
((SELECT id FROM users WHERE name='Phuong Nguyen'),'Sorry we do not','reply');
INSERT INTO chat(user_id,content,mess_type)
VALUES
((SELECT id FROM users WHERE name='Phuoc Nguyen'),'Hello','message');
INSERT INTO chat(user_id,content,mess_type)
VALUES
((SELECT id FROM users WHERE name='Phuoc Nguyen'),'hi','reply');
INSERT INTO chat(user_id,content,mess_type)
VALUES
((SELECT id FROM users WHERE name='Phuong Nguyen'),'ABC','message');
INSERT INTO chat(user_id,content,mess_type)
VALUES
((SELECT id FROM users WHERE name='Phuong Nguyen'),'DEF','reply');
INSERT INTO chat(user_id,content,mess_type)
VALUES
((SELECT id FROM users WHERE name='Phuoc Nguyen'),'Can i ask something','message');
INSERT INTO chat(user_id,content,mess_type)
VALUES
((SELECT id FROM users WHERE name='Phuoc Nguyen'),'Sure','reply');
INSERT INTO chat(user_id,content,mess_type)
VALUES
((SELECT id FROM users WHERE name='Phuong Nguyen'),'GHI','message');
INSERT INTO chat(user_id,content,mess_type)
VALUES
((SELECT id FROM users WHERE name='Phuong Nguyen'),'JKL','reply');
INSERT INTO chat(user_id,content,mess_type)
VALUES
((SELECT id FROM users WHERE name='Phuoc Nguyen'),'What is your considered','reply');


INSERT INTO rating(user_id,product_id,star,content)
VALUES 
((SELECT id FROM users WHERE name='Phuoc Nguyen'),(SELECT id FROM product WHERE title='Korean Style Pant'),4,'That cool');
INSERT INTO rating(user_id,product_id,star,content)
VALUES 
((SELECT id FROM users WHERE name='Nguyen Doan'),(SELECT id FROM product WHERE title='Korean Style Pant'),4,'hot hot hot');
INSERT INTO rating(user_id,product_id,star,content)
VALUES 
((SELECT id FROM users WHERE name='Phuong Nguyen'),(SELECT id FROM product WHERE title='Korean Style Pant'),4,'good good ');
INSERT INTO rating(user_id,product_id,star,content)
VALUES 
((SELECT id FROM users WHERE name='User 1'),(SELECT id FROM product WHERE title='Korean Style Pant'),4,'Its a bit to tight');
INSERT INTO rating(user_id,product_id,star,content)
VALUES 
((SELECT id FROM users WHERE name='User 2'),(SELECT id FROM product WHERE title='Korean Style Pant'),4,'x10 handsomeness');
INSERT INTO rating(user_id,product_id,star,content)
VALUES 
((SELECT id FROM users WHERE name='User 5'),(SELECT id FROM product WHERE title='Korean Style Pant'),4,'Its the best');
INSERT INTO rating(user_id,product_id,star,content)
VALUES 
((SELECT id FROM users WHERE name='User 6'),(SELECT id FROM product WHERE title='Korean Style Pant'),4,'Make live easier');
INSERT INTO rating(user_id,product_id,star,content)
VALUES 
((SELECT id FROM users WHERE name='Phuoc Nguyen'),(SELECT id FROM product WHERE title='Korean Style Pant'),4,'cool cool');
INSERT INTO rating(user_id,product_id,star,content)
VALUES 
((SELECT id FROM users WHERE name='Nguyen Doan'),(SELECT id FROM product WHERE title='Korean Style Pant'),4,'hot hot hot');
INSERT INTO rating(user_id,product_id,star,content)
VALUES 
((SELECT id FROM users WHERE name='Phuong Nguyen'),(SELECT id FROM product WHERE title='Korean Style Pant'),4,'good good ');
INSERT INTO rating(user_id,product_id,star,content)
VALUES 
((SELECT id FROM users WHERE name='User 1'),(SELECT id FROM product WHERE title='Korean Style Pant'),4,'Its a bit to tight');
INSERT INTO rating(user_id,product_id,star,content)
VALUES 
((SELECT id FROM users WHERE name='User 2'),(SELECT id FROM product WHERE title='Korean Style Pant'),4,'x10 handsomeness');
INSERT INTO rating(user_id,product_id,star,content)
VALUES 
((SELECT id FROM users WHERE name='User 3'),(SELECT id FROM product WHERE title='Korean Style Pant'),4,'But my handsomeness is 0');
INSERT INTO rating(user_id,product_id,star,content)
VALUES 
((SELECT id FROM users WHERE name='User 4'),(SELECT id FROM product WHERE title='Korean Style Pant'),1,'Its so cheap');
INSERT INTO rating(user_id,product_id,star,content)
VALUES 
((SELECT id FROM users WHERE name='User 5'),(SELECT id FROM product WHERE title='Korean Style Pant'),4,'Its the best');
INSERT INTO rating(user_id,product_id,star,content)
VALUES 
((SELECT id FROM users WHERE name='User 6'),(SELECT id FROM product WHERE title='Korean Style Pant'),4,'Make live easier');
INSERT INTO rating(user_id,product_id,star,content)
VALUES 
((SELECT id FROM users WHERE name='Phuoc Nguyen'),(SELECT id FROM product WHERE title='Korean Style Pant'),4,'Its a bit short for some guy over 7 feet high like me');


INSERT INTO comment(product_id,user_name,content)
VALUES 
((SELECT id FROM product WHERE title='Korean Style Pant'),'Nguyễn Trọng Phước','Make the decision, make another. Remake one past, you cannot.');
INSERT INTO comment(product_id,user_name,content)
VALUES 
((SELECT id FROM product WHERE title='Korean Style Pant'),'Nguyễn Phước','Be honest in your feelings, for they are the surest conduit to knowledge... ');
INSERT INTO comment(product_id,user_name,content)
VALUES 
((SELECT id FROM product WHERE title='Korean Style Pant'),'Jared Kerr','Reading without reflecting is like eating without digesting');
INSERT INTO comment(product_id,user_name,content)
VALUES 
((SELECT id FROM product WHERE title='Korean Style Pant'),'Lina Schroeder','We must dare to think unthinkable thoughts');
INSERT INTO comment(product_id,user_name,content)
VALUES 
((SELECT id FROM product WHERE title='Korean Style Pant'),'Kaleb Munoz','Remember to focus on goals that are within your control');
INSERT INTO comment(product_id,user_name,content)
VALUES 
((SELECT id FROM product WHERE title='Korean Style Pant'),'Yusuf Espinoza','In any project, the important factor is your belief. Without belief there can be no successful outcome');
INSERT INTO comment(product_id,user_name,content)
VALUES 
((SELECT id FROM product WHERE title='Korean Style Pant'),'Jaelynn Terrell','Life itself is the proper binge');
INSERT INTO comment(product_id,user_name,content)
VALUES 
((SELECT id FROM product WHERE title='Korean Style Pant'),'Madelyn Cabrera','Appreciate those early influences and what they''ve done for you.');
INSERT INTO comment(product_id,user_name,content)
VALUES 
((SELECT id FROM product WHERE title='Korean Style Pant'),'Tommy Lynch','No one would have crossed the ocean if he could have gotten off the ship in the storm');
INSERT INTO comment(product_id,user_name,content)
VALUES 
((SELECT id FROM product WHERE title='Korean Style Pant'),'Bridget Carey','Children really brighten up a household. They never turn the lights off.');
INSERT INTO comment(product_id,user_name,content)
VALUES 
((SELECT id FROM product WHERE title='Korean Style Pant'),'Kale Deleon','I can give you a six-word formula for success: Think things through, then follow through');
INSERT INTO comment(product_id,user_name,content)
VALUES 
((SELECT id FROM product WHERE title='Korean Style Pant'),'Micheal Burns','You can be rich and famous and still end up being unhappy');
INSERT INTO comment(product_id,user_name,content)
VALUES 
((SELECT id FROM product WHERE title='Korean Style Pant'),'Dennis Davila','One must live the way one thinks or end up thinking the way one has lived');
INSERT INTO comment(product_id,user_name,content)
VALUES 
((SELECT id FROM product WHERE title='Korean Style Pant'),'Landyn West','Synergy is the very essence of the family. Every family member contributes a different flavor to the mix');
INSERT INTO comment(product_id,user_name,content)
VALUES 
((SELECT id FROM product WHERE title='Korean Style Pant'),'Shiloh Dorsey','Its a love ly pant');
INSERT INTO comment(product_id,user_name,content)
VALUES 
((SELECT id FROM product WHERE title='Korean Style Pant'),'Izabelle Li','Is it available');
INSERT INTO comment(product_id,user_name,content)
VALUES 
((SELECT id FROM product WHERE title='Korean Style Pant'),'Joy Palmer','Can ship to vietnam?');
INSERT INTO comment(product_id,user_name,content)
VALUES 
((SELECT id FROM product WHERE title='Korean Style Pant'),'Brylee Rasmussen','A man should have the aim and the determination to be honest and upright and sincere in all that he undertakes.');
INSERT INTO comment(product_id,user_name,content)
VALUES 
((SELECT id FROM product WHERE title='Korean Style Pant'),'Kayleigh Acevedo','I have always believed that each man makes his own happiness and is responsible for his own problems. It is a simple philosophy');


INSERT INTO visit(_month,_year,_count)
VALUES (5,2021,500),
(6,2021,723),
(7,2021,1295),
(8,2021,1567),
(9,2021,2456),
(10,2021,2067),
(11,2021,1850),
(12,2021,1423);
