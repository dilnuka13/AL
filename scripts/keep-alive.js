#!/usr/bin/env node

/**
 * Supabase Keep-Alive Pulse Script
 * 
 * Prevents Supabase Free Tier projects from auto-pausing after 7 days of inactivity.
 * Sends an authenticated REST query to keep the Postgres instance and API warm.
 */

import https from 'https';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://hppojrbfhzttzvlvovre.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcG9qcmJmaHp0dHp2bHZvdnJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExODgxNDYsImV4cCI6MjA3Njc2NDE0Nn0.aL2fegb_eRPY0E7P6Mwufhq3TCAeX8-hDCHBo9VeAsA';

const url = new URL(SUPABASE_URL);

console.log('---------------------------------------------------------');
console.log('📡 [Supabase Keep-Alive] Initiating Heartbeat Signal...');
console.log(`🎯 Target Host: ${url.hostname}`);
console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
console.log('---------------------------------------------------------');

const endpoints = [
  '/rest/v1/system_settings?select=key&limit=1',
  '/rest/v1/notices?select=id&limit=1'
];

async function pingEndpoint(path) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const options = {
      hostname: url.hostname,
      path: path,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'User-Agent': 'DE-Education-KeepAlive/1.0'
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const latency = Date.now() - startTime;
        resolve({
          path,
          statusCode: res.statusCode,
          latency,
          data
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout after 10000ms on ${path}`));
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}

async function run() {
  let successCount = 0;
  for (const endpoint of endpoints) {
    try {
      const result = await pingEndpoint(endpoint);
      if (result.statusCode >= 200 && result.statusCode < 300) {
        console.log(`✅ [HTTP ${result.statusCode}] ${endpoint} (Latency: ${result.latency}ms)`);
        successCount++;
      } else {
        console.warn(`⚠️ [HTTP ${result.statusCode}] ${endpoint} (Latency: ${result.latency}ms) - Response: ${result.data}`);
      }
    } catch (err) {
      console.error(`❌ Failed to ping ${endpoint}:`, err.message);
    }
  }

  console.log('---------------------------------------------------------');
  if (successCount > 0) {
    console.log('🟢 Heartbeat Pulse Delivered Successfully!');
    console.log('🛡️ Supabase 7-day auto-pause timer has been reset.');
    console.log('---------------------------------------------------------');
    process.exit(0);
  } else {
    console.error('🔴 All heartbeat ping requests failed!');
    console.log('---------------------------------------------------------');
    process.exit(1);
  }
}

run();
