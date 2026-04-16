-- ============================================================
-- setup.sql — Blood Donation Management System
-- Run this ONCE in MySQL Workbench or MySQL CLI
-- ============================================================

CREATE DATABASE IF NOT EXISTS bloodDonationDB;
USE bloodDonationDB;

-- ============================================================
-- TABLE 1: admin_users
-- Stores admin login credentials
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(50)  NOT NULL UNIQUE,
  password   VARCHAR(100) NOT NULL,
  email      VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 2: donors
-- Stores registered blood donors
-- ============================================================
CREATE TABLE IF NOT EXISTS donors (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  age        INT          NOT NULL,
  bloodGroup VARCHAR(5)   NOT NULL,
  city       VARCHAR(100) NOT NULL,
  contact    VARCHAR(15)  NOT NULL,
  email      VARCHAR(100),
  gender     VARCHAR(10),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 3: blood_banks
-- Stores blood bank details
-- ============================================================
CREATE TABLE IF NOT EXISTS blood_banks (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  name     VARCHAR(150) NOT NULL,
  city     VARCHAR(100) NOT NULL,
  address  VARCHAR(255) NOT NULL,
  contact  VARCHAR(15)  NOT NULL,
  email    VARCHAR(100),
  timings  VARCHAR(100)
);

-- ============================================================
-- TABLE 4: hospitals
-- Stores hospital details
-- ============================================================
CREATE TABLE IF NOT EXISTS hospitals (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  name     VARCHAR(150) NOT NULL,
  city     VARCHAR(100) NOT NULL,
  address  VARCHAR(255) NOT NULL,
  contact  VARCHAR(15)  NOT NULL,
  email    VARCHAR(100)
);

-- ============================================================
-- TABLE 5: blood_requests
-- Stores requests for blood by patients/hospitals
-- ============================================================
CREATE TABLE IF NOT EXISTS blood_requests (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  patient_name VARCHAR(100) NOT NULL,
  bloodGroup  VARCHAR(5)   NOT NULL,
  units       INT          NOT NULL,
  hospital_id INT,
  city        VARCHAR(100) NOT NULL,
  contact     VARCHAR(15)  NOT NULL,
  status      ENUM('Pending','Fulfilled','Cancelled') DEFAULT 'Pending',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL
);

-- ============================================================
-- TABLE 6: donation_history
-- Stores record of every donation made
-- ============================================================
CREATE TABLE IF NOT EXISTS donation_history (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  donor_id     INT NOT NULL,
  blood_bank_id INT,
  units        INT NOT NULL DEFAULT 1,
  donation_date DATE NOT NULL,
  notes        VARCHAR(255),
  FOREIGN KEY (donor_id)      REFERENCES donors(id)      ON DELETE CASCADE,
  FOREIGN KEY (blood_bank_id) REFERENCES blood_banks(id) ON DELETE SET NULL
);

-- ============================================================
-- TABLE 7: blood_stock
-- Tracks blood inventory at each blood bank
-- ============================================================
CREATE TABLE IF NOT EXISTS blood_stock (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  blood_bank_id INT NOT NULL,
  bloodGroup    VARCHAR(5) NOT NULL,
  units         INT NOT NULL DEFAULT 0,
  last_updated  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (blood_bank_id) REFERENCES blood_banks(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE 8: volunteers
-- Stores volunteer details
-- ============================================================
CREATE TABLE IF NOT EXISTS volunteers (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  city       VARCHAR(100) NOT NULL,
  contact    VARCHAR(15)  NOT NULL,
  email      VARCHAR(100),
  skills     VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 9: camps
-- Stores blood donation camp/event details
-- ============================================================
CREATE TABLE IF NOT EXISTS camps (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(150) NOT NULL,
  city       VARCHAR(100) NOT NULL,
  venue      VARCHAR(255) NOT NULL,
  camp_date  DATE         NOT NULL,
  organizer  VARCHAR(100),
  contact    VARCHAR(15)
);

-- ============================================================
-- TABLE 10: feedback
-- Stores user feedback/messages
-- ============================================================
CREATE TABLE IF NOT EXISTS feedback (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100),
  message    TEXT         NOT NULL,
  rating     INT CHECK (rating BETWEEN 1 AND 5),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SAMPLE DATA
-- ============================================================

INSERT INTO admin_users (username, password, email) VALUES
('admin', 'admin123', 'admin@bloodbank.com');

INSERT INTO blood_banks (name, city, address, contact, email, timings) VALUES
('LifeLine Blood Bank',  'Mumbai', 'Andheri West, Mumbai',    '9900112233', 'lifeline@bb.com',  '8AM - 8PM'),
('RedCross Blood Bank',  'Pune',   'Shivajinagar, Pune',      '9800223344', 'redcross@bb.com',  '9AM - 6PM'),
('CityBlood Centre',     'Delhi',  'Connaught Place, Delhi',  '9700334455', 'city@bb.com',      '24 Hours');

INSERT INTO hospitals (name, city, address, contact, email) VALUES
('Apollo Hospital',    'Mumbai', 'Juhu, Mumbai',          '9600445566', 'apollo@hosp.com'),
('Sahyadri Hospital',  'Pune',   'Deccan, Pune',          '9500556677', 'sahyadri@hosp.com'),
('AIIMS',              'Delhi',  'Ansari Nagar, Delhi',   '9400667788', 'aiims@hosp.com');

INSERT INTO donors (name, age, bloodGroup, city, contact, email, gender) VALUES
('Rahul Sharma',  25, 'A+',  'Mumbai', '9876543210', 'rahul@email.com',  'Male'),
('Priya Patel',   30, 'B+',  'Pune',   '9123456789', 'priya@email.com',  'Female'),
('Amit Singh',    22, 'O+',  'Mumbai', '9988776655', 'amit@email.com',   'Male'),
('Neha Gupta',    28, 'AB+', 'Delhi',  '9001122334', 'neha@email.com',   'Female'),
('Raj Kumar',     35, 'A-',  'Mumbai', '9112233445', 'raj@email.com',    'Male');

INSERT INTO blood_requests (patient_name, bloodGroup, units, hospital_id, city, contact, status) VALUES
('Suresh Mehta',  'A+',  2, 1, 'Mumbai', '9871234567', 'Pending'),
('Kavya Reddy',   'O-',  1, 2, 'Pune',   '9762345678', 'Fulfilled'),
('Mohan Das',     'B+',  3, 3, 'Delhi',  '9653456789', 'Pending');

INSERT INTO donation_history (donor_id, blood_bank_id, units, donation_date) VALUES
(1, 1, 1, '2024-01-15'),
(2, 2, 1, '2024-02-20'),
(3, 1, 1, '2024-03-10'),
(1, 1, 1, '2024-06-18');

INSERT INTO blood_stock (blood_bank_id, bloodGroup, units) VALUES
(1,'A+',10),(1,'A-',5),(1,'B+',8),(1,'B-',3),(1,'O+',15),(1,'O-',4),(1,'AB+',6),(1,'AB-',2),
(2,'A+',7), (2,'B+',5),(2,'O+',12),(2,'AB+',4),
(3,'A+',9), (3,'O+',11),(3,'B+',6),(3,'AB-',3);

INSERT INTO volunteers (name, city, contact, email, skills) VALUES
('Sneha Joshi',  'Mumbai', '9876001122', 'sneha@email.com', 'Event Management'),
('Vikram Nair',  'Pune',   '9765002233', 'vikram@email.com','Driving, First Aid'),
('Anita Roy',    'Delhi',  '9654003344', 'anita@email.com', 'Medical Background');

INSERT INTO camps (title, city, venue, camp_date, organizer, contact) VALUES
('Save A Life Camp',     'Mumbai', 'Andheri Sports Complex', '2025-02-10', 'LifeLine NGO',  '9900001111'),
('Blood Heroes Drive',   'Pune',   'Fergusson College Ground','2025-03-05', 'RedCross Pune', '9800002222'),
('National Donors Day',  'Delhi',  'India Gate Lawns',        '2025-04-14', 'AIIMS Delhi',   '9700003333');

INSERT INTO feedback (name, email, message, rating) VALUES
('Rohit Shah',   'rohit@email.com', 'Great initiative! Very easy to register.', 5),
('Meera Iyer',   'meera@email.com', 'Found a donor quickly. Thank you!',        4),
('Karan Bose',   'karan@email.com', 'Could add more cities.',                   3);

-- Verify all tables
SHOW TABLES;