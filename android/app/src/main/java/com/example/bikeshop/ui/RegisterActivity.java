package com.example.bikeshop.ui;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.example.bikeshop.R;
import com.example.bikeshop.api.RetrofitClient;
import com.example.bikeshop.model.User;
import com.google.android.material.textfield.TextInputEditText;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RegisterActivity extends AppCompatActivity {

    private TextInputEditText etFirstname, etLastname, etPhone, etUsername, etPassword;
    private Button btnRegister;
    private static final String TAG = "RegisterActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        etFirstname = findViewById(R.id.et_firstname);
        etLastname = findViewById(R.id.et_lastname);
        etPhone = findViewById(R.id.et_phone);
        etUsername = findViewById(R.id.et_username);
        etPassword = findViewById(R.id.et_password);
        btnRegister = findViewById(R.id.btn_register);

        btnRegister.setOnClickListener(v -> register());
        
        findViewById(R.id.tv_login_back).setOnClickListener(v -> {
            finish(); // Back to Login
        });
    }

    private void register() {
        String fname = etFirstname.getText().toString().trim();
        String lname = etLastname.getText().toString().trim();
        String phone = etPhone.getText().toString().trim();
        String uname = etUsername.getText().toString().trim();
        String pwd = etPassword.getText().toString().trim();

        if (fname.isEmpty() || lname.isEmpty() || phone.isEmpty() || uname.isEmpty() || pwd.isEmpty()) {
            Toast.makeText(this, "Пожалуйста, заполните все поля", Toast.LENGTH_SHORT).show();
            return;
        }

        User user = new User();
        user.setFirstName(fname);
        user.setLastName(lname);
        user.setPhone(phone);
        user.setUsername(uname);
        user.setPassword(pwd);

        RetrofitClient.getApiService().register(user).enqueue(new Callback<User>() {
            @Override
            public void onResponse(Call<User> call, Response<User> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(RegisterActivity.this, "Регистрация успешна!", Toast.LENGTH_LONG).show();
                    finish(); // Back to login screen
                } else {
                    Toast.makeText(RegisterActivity.this, "Ошибка: имя пользователя уже занято", Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(Call<User> call, Throwable t) {
                Log.e(TAG, "Registration failed: " + t.getMessage());
                Toast.makeText(RegisterActivity.this, "Ошибка сети: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }
}
