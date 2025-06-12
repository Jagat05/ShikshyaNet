const express=require('express');
const router=express.Router();


router.post('/add-fee',(req,res)=>{
res.status(200).json({
  msg:"Add New Fee Request !"
});
});

module.exports=router;