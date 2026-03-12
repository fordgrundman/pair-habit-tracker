function Help() {
  return (
    <>
      <h1>Help</h1>
      <ul>
        <li>
          <span id="emphasis-span">To add a habit</span>, go to "Habits List"
          and click on the "Add Habit" button, Give your new habit a descriptive
          title and choose the interval (if the habit should be completed daily
          or weekly). Click the "Add" button.
        </li>
        <li>
          <span id="emphasis-span">To mark a habit as completed</span>, click on
          the checkbox to the left of any habit. The checkbox will be
          automatically unchecked again each day/week (based on the interval you
          set for that habit), so it's ready for you to complete again!
        </li>
        <li>
          <span id="emphasis-span">To edit a habit</span>, go to "Habits List"
          and click on the pencil icon. Change the desired information and click
          the "Save Changes" button.
        </li>
        <li>
          <span id="emphasis-span">To delete a habit</span>, go to "Habits List"
          and click on the trash bin icon next to the habit. Verify deletion by
          clicking the "Delete" button in the pop-up box.
        </li>
        <li>
          <span id="emphasis-span">To post a habit for pairing</span>, go to
          "Pair Page" and click the "Post Habit" button. Choose one of your
          available habits from the menu. Your habit will appear on the Public
          Board for others to pair with.
        </li>
        <li>
          <span id="emphasis-span">To pair with someone else's habit</span>,
          find their habit on the Public Board and click the "Pair" button. A
          copy of that habit will be added to your "My Pairings" section,
          linking you both together.
        </li>
        <li>
          <span id="emphasis-span">To unpost a habit</span>, find your posted
          habit on the Public Board and click the "Unpost" button to remove it
          from the board.
        </li>
        <li>
          <span id="emphasis-span">To build a streak</span>, complete your habit
          each day (for daily habits) or each week (for weekly habits). Your
          streak count is displayed next to each habit. If you miss a day or
          week, your streak resets to zero.
        </li>
        <li>
          <span id="emphasis-span">For paired streaks</span>, both you and your
          partner must complete the habit within the same interval for the
          paired streak to advance. If either partner misses, the paired streak
          resets.
        </li>
      </ul>
    </>
  );
}

export default Help;
