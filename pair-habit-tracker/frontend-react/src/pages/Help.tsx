import React from 'react'

function Help() {
  return (
    <>
        <h1>Help</h1>
        <ul>
            <li><span id="emphasis-span">To add a habit</span>, go to "Habits List" and click on the "Add Habit" button, Give your new habit a descriptive title and choose the interval (if the habit should be completed daily or weekly). Click the "Add" button.</li>
            <li><span id="emphasis-span">To mark a habit as completed</span>, click on the checkbox to the left of any habit. The checkbox will be automatically unchecked again each day/week (based on the interval you set for that habit), so it's ready for you to complete again!</li>
            <li><span id="emphasis-span">To edit a habit</span>, go to "Habits List" and click on the pencil icon. Change the desired information and click the "Save Changes" button.</li>
            <li><span id="emphasis-span">To delete a habit</span>, go to "Habits List" and click on the trash bin icon next to the habit. Verify deletion by clicking the "Delete" button in the pop-up box.</li>
        </ul>
    </>
  )
}

export default Help