DROP PROCEDURE IF EXISTS sp_add_job;

CREATE PROCEDURE sp_add_job(
    IN p_client_id BIGINT,
    IN p_title VARCHAR(255),
    IN p_description TEXT,
    IN p_location VARCHAR(255),
    IN p_status VARCHAR(255),
    IN p_min_salary DECIMAL(10,2),
    IN p_max_salary DECIMAL(10,2),
    IN p_actual_salary DECIMAL(10,2),
    IN p_rate_type ENUM('hourly', 'yearly', 'fixed'),
    OUT p_job_id BIGINT
)
BEGIN
    -- Declare handler at the start of BEGIN block
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    -- Validate salary constraints
    IF p_min_salary >= p_max_salary THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Minimum salary must be less than maximum salary';
    END IF;

    IF p_actual_salary < p_min_salary OR p_actual_salary > p_max_salary THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Actual salary must be between minimum and maximum salary';
    END IF;

    START TRANSACTION;
    
    INSERT INTO job (
        client_id,
        title,
        description,
        location,
        status,
        min_salary,
        max_salary,
        actual_salary,
        rate_type
    ) VALUES (
        p_client_id,
        p_title,
        p_description,
        p_location,
        p_status,
        p_min_salary,
        p_max_salary,
        p_actual_salary,
        p_rate_type
    );
    
    SET p_job_id = LAST_INSERT_ID();
    COMMIT;
END;
