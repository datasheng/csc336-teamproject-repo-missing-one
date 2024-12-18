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
    -- checks for any sql errors
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    -- Validate salary constraints
    IF p_min_salary >= p_max_salary THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error message from SP: Minimum salary must be less than maximum salary';
    END IF;

    IF p_actual_salary < p_min_salary OR p_actual_salary > p_max_salary THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error message from SP: Actual salary must be between minimum and maximum salary';
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



-- 2nd procedure


DROP PROCEDURE IF EXISTS sp_apply_for_job;

CREATE PROCEDURE sp_apply_for_job(
    IN p_job_id BIGINT,
    IN p_contractor_id BIGINT,
    IN p_tell_answer TEXT,
    IN p_fit_answer TEXT,
    IN p_ambitious_answer TEXT,
    IN p_location VARCHAR(255),
    OUT p_application_id BIGINT
)
BEGIN
    -- variable to store our checks
    DECLARE existing_application BIGINT;
    

    -- Check if contractor has already applied
    SELECT application_id INTO existing_application 
    FROM job_application 
    WHERE job_id = p_job_id AND contractor_id = p_contractor_id
    LIMIT 1;
    
    IF existing_application IS NOT NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Message from SP: You have already applied for this job';
    END IF;

    -- Start transaction for the insert
    START TRANSACTION;
    
    -- Insert application
    INSERT INTO job_application (
        job_id,
        contractor_id,
        tell_answer,
        fit_answer,
        ambitious_answer,
        location,
        date_applied,
        status
    ) VALUES (
        p_job_id,
        p_contractor_id,
        p_tell_answer,
        p_fit_answer,
        p_ambitious_answer,
        p_location,
        NOW(),
        'Pending'
    );
    
    -- Get the new application ID
    SET p_application_id = LAST_INSERT_ID();
    
    -- Commit transaction
    COMMIT;
END;

