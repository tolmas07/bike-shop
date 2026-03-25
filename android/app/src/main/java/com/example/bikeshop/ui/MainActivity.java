package com.example.bikeshop.ui;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import com.example.bikeshop.R;
import com.google.android.material.bottomnavigation.BottomNavigationView;

public class MainActivity extends AppCompatActivity {

    private static final String TAG = "MainActivity";
    private Fragment catalogFragment = new CatalogFragment();
    private Fragment cartFragment = new CartFragment();
    private Fragment favoriteFragment = new FavoriteFragment();
    private Fragment profileFragment = new ProfileFragment();
    private Fragment activeFragment = catalogFragment;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Final authentication check before showing Main UI
        SharedPreferences prefs = getSharedPreferences("BikeShop", MODE_PRIVATE);
        if (prefs.getLong("userId", -1) == -1) {
            startActivity(new Intent(this, LoginActivity.class));
            finish();
            return;
        }

        try {
            setContentView(R.layout.activity_main);
            
            BottomNavigationView nav = findViewById(R.id.bottom_navigation);
            
            // Add all fragments to manager but hide others
            getSupportFragmentManager().beginTransaction().add(R.id.fragment_container, profileFragment, "4").hide(profileFragment).commit();
            getSupportFragmentManager().beginTransaction().add(R.id.fragment_container, favoriteFragment, "3").hide(favoriteFragment).commit();
            getSupportFragmentManager().beginTransaction().add(R.id.fragment_container, cartFragment, "2").hide(cartFragment).commit();
            getSupportFragmentManager().beginTransaction().add(R.id.fragment_container, catalogFragment, "1").commit();

            nav.setOnItemSelectedListener(item -> {
                int id = item.getItemId();
                Fragment target = null;
                
                if (id == R.id.nav_catalog) target = catalogFragment;
                else if (id == R.id.nav_cart) target = cartFragment;
                else if (id == R.id.nav_favorites) target = favoriteFragment;
                else if (id == R.id.nav_profile) target = profileFragment;

                if (target != null && target != activeFragment) {
                    switchToFragment(target);
                    return true;
                }
                return false;
            });

        } catch (Exception e) {
            Log.e(TAG, "Crash in onCreate: " + e.getMessage());
        }
    }

    private void switchToFragment(Fragment target) {
        getSupportFragmentManager()
                .beginTransaction()
                .setCustomAnimations(android.R.anim.fade_in, android.R.anim.fade_out)
                .hide(activeFragment)
                .show(target)
                .commit();
        activeFragment = target;
    }
}
