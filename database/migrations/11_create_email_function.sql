-- Create function to send verification email
CREATE OR REPLACE FUNCTION send_verification_email(
    email_address VARCHAR,
    verification_code VARCHAR
)
RETURNS void AS $$
BEGIN
    -- Send email using Supabase's built-in email service
    SELECT net.http_post(
        url := 'https://api.supabase.com/v1/auth/send-email',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
        ),
        body := jsonb_build_object(
            'email', email_address,
            'template', 'verification',
            'subject', 'Nyaata Aadaa - Koodii Mirkaneessaa',
            'data', jsonb_build_object(
                'code', verification_code,
                'site_name', 'Nyaata Aadaa'
            )
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION send_verification_email TO authenticated;
GRANT EXECUTE ON FUNCTION send_verification_email TO anon; 