-- ============================================================
-- AI-Enhanced Freelancer Marketplace - Database Setup
-- ============================================================

-- Create database
CREATE DATABASE IF NOT EXISTS freelancer_marketplace
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE freelancer_marketplace;

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('freelancer', 'client') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB;

-- ============================================================
-- FREELANCER PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS freelancer_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    title VARCHAR(255),
    skills JSON,
    experience INT DEFAULT 0,
    hourly_rate DECIMAL(10,2) DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    completed_projects INT DEFAULT 0,
    bio TEXT,
    education VARCHAR(500),
    availability ENUM('full-time', 'part-time', 'contract') DEFAULT 'full-time',
    portfolio JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- CLIENT PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS client_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    company VARCHAR(255),
    industry VARCHAR(255),
    website VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- PROJECTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    requirements JSON,
    skills JSON,
    category VARCHAR(100),
    budget DECIMAL(10,2),
    deadline DATE,
    experience_level ENUM('beginner', 'intermediate', 'expert') DEFAULT 'intermediate',
    status ENUM('open', 'in-progress', 'completed', 'cancelled') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_client_id (client_id),
    INDEX idx_status (status),
    INDEX idx_category (category)
) ENGINE=InnoDB;

-- ============================================================
-- APPLICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    freelancer_id INT NOT NULL,
    proposed_budget DECIMAL(10,2),
    cover_letter TEXT,
    status ENUM('pending', 'shortlisted', 'accepted', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (project_id, freelancer_id),
    INDEX idx_project_id (project_id),
    INDEX idx_freelancer_id (freelancer_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- ============================================================
-- HIRES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS hires (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    freelancer_id INT NOT NULL,
    client_id INT NOT NULL,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (freelancer_id) REFERENCES users(id),
    FOREIGN KEY (client_id) REFERENCES users(id),
    INDEX idx_project_id (project_id),
    INDEX idx_freelancer_id (freelancer_id),
    INDEX idx_client_id (client_id)
) ENGINE=InnoDB;

-- ============================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================

-- Note: Passwords are hashed with salt. For testing, you can register through the app.
-- Below is an example of inserting a test user (password: test123)

-- INSERT INTO users (email, password, name, role) VALUES 
-- ('test@freelancer.com', 'a1b2c3d4e5f6:5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Test Freelancer', 'freelancer'),
-- ('test@client.com', 'a1b2c3d4e5f6:5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Test Client', 'client');

-- ============================================================
-- VIEWS (Optional - for reporting)
-- ============================================================

-- View for freelancer statistics
CREATE OR REPLACE VIEW v_freelancer_stats AS
SELECT 
    u.id,
    u.name,
    u.email,
    fp.title,
    fp.skills,
    fp.experience,
    fp.hourly_rate,
    fp.rating,
    fp.completed_projects,
    COUNT(DISTINCT a.id) as total_applications,
    SUM(CASE WHEN a.status = 'accepted' THEN 1 ELSE 0 END) as accepted_applications
FROM users u
JOIN freelancer_profiles fp ON u.id = fp.user_id
LEFT JOIN applications a ON u.id = a.freelancer_id
WHERE u.role = 'freelancer'
GROUP BY u.id, u.name, u.email, fp.title, fp.skills, fp.experience, 
         fp.hourly_rate, fp.rating, fp.completed_projects;

-- View for project statistics
CREATE OR REPLACE VIEW v_project_stats AS
SELECT 
    p.id,
    p.title,
    p.status,
    p.budget,
    p.category,
    u.name as client_name,
    COUNT(DISTINCT a.id) as applicant_count,
    SUM(CASE WHEN a.status = 'accepted' THEN 1 ELSE 0 END) as hired_count
FROM projects p
JOIN users u ON p.client_id = u.id
LEFT JOIN applications a ON p.id = a.project_id
GROUP BY p.id, p.title, p.status, p.budget, p.category, u.name;

-- ============================================================
-- PROCEDURES (Optional)
-- ============================================================

-- Procedure to get freelancer match score
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_get_freelancer_match(
    IN p_freelancer_id INT,
    IN p_project_id INT
)
BEGIN
    SELECT 
        u.id as freelancer_id,
        u.name,
        fp.title,
        fp.skills,
        fp.experience,
        fp.rating,
        p.title as project_title,
        p.skills as required_skills,
        p.category,
        p.experience_level
    FROM users u
    JOIN freelancer_profiles fp ON u.id = fp.user_id
    CROSS JOIN projects p
    WHERE u.id = p_freelancer_id AND p.id = p_project_id;
END //
DELIMITER ;

-- ============================================================
-- DONE
-- ============================================================
SELECT 'Database setup complete!' as message;
