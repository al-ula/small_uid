mod utils;

use rand::Rng;
use wasm_bindgen::prelude::*;

// #[global_allocator]
// static ALLOCATOR: talc::TalckWasm = unsafe { talc::TalckWasm::new_global() };

#[global_allocator]
static ALLOCATOR: talc::Talck<talc::locking::AssumeUnlockable, talc::ClaimOnOom> = {
    // REDUCED: From 16 MB to 16 KB. Adjust as needed.
    static mut MEMORY: [u8; 0x4000] = [0; 0x4000]; // 0x4000 = 16384 bytes

    let span = talc::Span::from_array(std::ptr::addr_of!(MEMORY).cast_mut());
    talc::Talc::new(unsafe { talc::ClaimOnOom::new(span) }).lock()
};

#[cfg(debug_assertions)]
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

fn random_gen() -> u64 {
    rand::rng().random_range(0..(1 << 20))
}

/// @param {number | null} count - Amount to generate. It's advised to not generate over 1024 numbers.
#[wasm_bindgen]
pub fn generate(count: Option<usize>) -> Vec<u64> {
    let count = count.unwrap_or(1);
    if count == 1 {
        vec![random_gen()]
    } else {
        let mut randoms = Vec::with_capacity(count);
        for _ in 0..count {
            randoms.push(random_gen());
        }
        randoms
    }
}

#[cfg(debug_assertions)]
#[wasm_bindgen]
pub fn generate_with_metrics(count: Option<usize>) -> Vec<u64> {
    let pre = ALLOCATOR.lock().get_counters().clone();
    let pre = format!("{:#?}", pre);
    log(&pre);
    let randoms = generate(count);
    let post = ALLOCATOR.lock().get_counters().clone();
    let post = format!("{:#?}", post);
    log(&post);
    randoms
}
