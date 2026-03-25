package com.example.bikeshop.ui;

import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.animation.AccelerateDecelerateInterpolator;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import com.example.bikeshop.R;

public class PaymentActivity extends AppCompatActivity {

    private ImageView checkmark;
    private View loadingCircle;
    private TextView statusText;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_payment);

        checkmark = findViewById(R.id.checkmark);
        loadingCircle = findViewById(R.id.loading_circle);
        statusText = findViewById(R.id.status_text);

        startPaymentAnimation();
    }

    private void startPaymentAnimation() {
        // Pulse animation for modern design
        ObjectAnimator pulseX = ObjectAnimator.ofFloat(loadingCircle, "scaleX", 1f, 1.2f, 1f);
        ObjectAnimator pulseY = ObjectAnimator.ofFloat(loadingCircle, "scaleY", 1f, 1.2f, 1f);
        pulseX.setRepeatCount(ObjectAnimator.INFINITE);
        pulseY.setRepeatCount(ObjectAnimator.INFINITE);
        pulseX.setDuration(1200);
        pulseY.setDuration(1200);

        final AnimatorSet set = new AnimatorSet();
        set.playTogether(pulseX, pulseY);
        set.start();

        // Modern Handler with MainLooper to avoid Deprecation
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            if (isFinishing()) return;
            set.cancel();
            loadingCircle.setVisibility(View.GONE);
            checkmark.setVisibility(View.VISIBLE);
            statusText.setText("Оплата успешно завершена!");

            // Smooth Pop animation
            ObjectAnimator popX = ObjectAnimator.ofFloat(checkmark, "scaleX", 0f, 1.15f, 1f);
            ObjectAnimator popY = ObjectAnimator.ofFloat(checkmark, "scaleY", 0f, 1.15f, 1f);
            popX.setDuration(600);
            popY.setDuration(600);
            popX.setInterpolator(new AccelerateDecelerateInterpolator());
            popY.setInterpolator(new AccelerateDecelerateInterpolator());

            AnimatorSet popSet = new AnimatorSet();
            popSet.playTogether(popX, popY);
            popSet.start();

            // Finish Activity after success display
            new Handler(Looper.getMainLooper()).postDelayed(this::finish, 2500);
        }, 3000);
    }
}
